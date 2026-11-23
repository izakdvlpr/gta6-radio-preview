import { useCallback, useEffect, useRef, useState } from "react";
import { type Station, stations } from "../data/stations";

const CARD_SIZE = 64;
const CARD_GAP = 16;
const VIEWPORT_WIDTH = 7 * CARD_SIZE + 6 * CARD_GAP;
const DRAG_CLICK_THRESHOLD = 6;

type SpotifyEmbedController = {
	play: () => void;
	pause: () => void;
	loadUri: (uri: string) => void;
	destroy: () => void;
};

type SpotifyIframeApi = {
	createController: (
		element: HTMLElement,
		options: { uri: string; width: string; height: number },
		callback: (controller: SpotifyEmbedController) => void,
	) => void;
};

declare global {
	interface Window {
		onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
	}
}

function Chevron({
	direction,
	onClick,
}: {
	direction: "left" | "right";
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={direction === "left" ? "Estação anterior" : "Próxima estação"}
			className="px-3 text-4xl text-neutral-400 transition-colors hover:text-white"
		>
			{direction === "left" ? "‹" : "›"}
		</button>
	);
}

function StationLogo({
	station,
	selected,
	dimmed,
}: {
	station: Station;
	selected: boolean;
	dimmed: boolean;
}) {
	return (
		<div
			className={`flex h-16 w-16 items-center justify-center overflow-hidden transition-all duration-150 ${
				station.logoOnLight ? "bg-neutral-200" : "bg-neutral-900"
			} ${selected ? "scale-110 ring-3 ring-white" : "opacity-80"} ${dimmed ? "grayscale" : ""}`}
		>
			<img
				src={station.logoSrc}
				alt={station.name}
				className="max-h-full max-w-full object-contain"
				draggable={false}
			/>
		</div>
	);
}

function ShoulderButton({
	label,
	onClick,
}: {
	label: "L1" | "R1";
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className="rounded border-2 border-neutral-300 px-1.5 py-0.5 text-xs font-bold text-neutral-200 transition-colors hover:bg-neutral-700"
		>
			{label}
		</button>
	);
}

function SpotifyPreview({
	station,
	powered,
}: {
	station: Station;
	powered: boolean;
}) {
	const mountRef = useRef<HTMLDivElement>(null);
	const controllerRef = useRef<SpotifyEmbedController | null>(null);
	const poweredRef = useRef(powered);
	poweredRef.current = powered;

	// biome-ignore lint/correctness/useExhaustiveDependencies: uri inicial apenas; trocas usam loadUri
	useEffect(() => {
		window.onSpotifyIframeApiReady = (api) => {
			if (!mountRef.current) return;
			api.createController(
				mountRef.current,
				{
					uri: `spotify:playlist:${station.spotifyId}`,
					width: "100%",
					height: 352,
				},
				(controller) => {
					controllerRef.current = controller;
					if (poweredRef.current) controller.play();
				},
			);
		};

		if (!document.getElementById("spotify-iframe-api")) {
			const script = document.createElement("script");
			script.id = "spotify-iframe-api";
			script.src = "https://open.spotify.com/embed/iframe-api/v1";
			script.async = true;
			document.body.appendChild(script);
		}

		return () => {
			controllerRef.current?.destroy();
			controllerRef.current = null;
		};
	}, []);

	const prevSpotifyIdRef = useRef(station.spotifyId);
	useEffect(() => {
		const controller = controllerRef.current;
		if (!controller || prevSpotifyIdRef.current === station.spotifyId) return;
		prevSpotifyIdRef.current = station.spotifyId;
		controller.loadUri(`spotify:playlist:${station.spotifyId}`);
		if (powered) {
			const timer = setTimeout(() => controller.play(), 400);
			return () => clearTimeout(timer);
		}
	}, [station.spotifyId, powered]);

	useEffect(() => {
		if (powered) controllerRef.current?.play();
		else controllerRef.current?.pause();
	}, [powered]);

	return (
		<div className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
			<div className="flex items-center justify-between px-4 py-2">
				<span className="font-hud text-sm tracking-wide text-neutral-300 uppercase">
					Playlist — {station.name}
				</span>
				<div className="flex items-center gap-3">
					<a
						href={`https://gta.fandom.com/wiki/Radio_Stations_in_GTA_VI#${station.wikiAnchor}`}
						target="_blank"
						rel="noreferrer"
						className="text-xs font-medium text-neutral-400 transition-colors hover:text-white hover:underline"
					>
						Detalhes na Wiki
					</a>
					<a
						href={`https://open.spotify.com/playlist/${station.spotifyId}`}
						target="_blank"
						rel="noreferrer"
						className="text-xs font-medium text-[#1db954] hover:underline"
					>
						Abrir no Spotify
					</a>
				</div>
			</div>
			<div ref={mountRef} />
		</div>
	);
}

function SpotifyPreviewGate(props: { station: Station; powered: boolean }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		if (props.powered) setMounted(true);
	}, [props.powered]);
	if (!mounted) return null;
	return (
		<div className={props.powered ? "w-full max-w-md" : "hidden"}>
			<SpotifyPreview {...props} />
		</div>
	);
}

export function RadioPanel() {
	const [index, setIndex] = useState(8);
	const [powered, setPowered] = useState(false);
	const [dragDelta, setDragDelta] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [sliderDragging, setSliderDragging] = useState(false);
	const sliderTrackRef = useRef<HTMLDivElement>(null);
	const draggingRef = useRef(false);
	const dragStartXRef = useRef(0);
	const station = stations[index];

	const step = useCallback(
		(delta: number) =>
			setIndex(
				(current) => (current + delta + stations.length) % stations.length,
			),
		[],
	);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "ArrowLeft") step(-1);
			if (event.key === "ArrowRight") step(1);
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [step]);

	const baseOffset =
		VIEWPORT_WIDTH / 2 - CARD_SIZE / 2 - index * (CARD_SIZE + CARD_GAP);
	const offset = baseOffset + dragDelta;

	function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
		draggingRef.current = true;
		setIsDragging(true);
		dragStartXRef.current = event.clientX;
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
		if (!draggingRef.current) return;
		setDragDelta(event.clientX - dragStartXRef.current);
	}

	function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
		if (!draggingRef.current) return;
		draggingRef.current = false;
		setIsDragging(false);
		if (Math.abs(dragDelta) <= DRAG_CLICK_THRESHOLD) {
			const el = document.elementFromPoint(event.clientX, event.clientY);
			const btn = el?.closest<HTMLElement>("[data-station-index]");
			if (btn) setIndex(Number(btn.dataset.stationIndex));
		} else {
			const raw =
				(VIEWPORT_WIDTH / 2 - CARD_SIZE / 2 - (baseOffset + dragDelta)) /
				(CARD_SIZE + CARD_GAP);
			setIndex(Math.min(Math.max(Math.round(raw), 0), stations.length - 1));
		}
		setDragDelta(0);
	}

	function indexFromSliderX(clientX: number) {
		const track = sliderTrackRef.current;
		if (!track) return index;
		const rect = track.getBoundingClientRect();
		const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
		return Math.round(ratio * (stations.length - 1));
	}

	function onSliderPointerDown(event: React.PointerEvent<HTMLDivElement>) {
		setSliderDragging(true);
		event.currentTarget.setPointerCapture(event.pointerId);
		setIndex(indexFromSliderX(event.clientX));
	}

	function onSliderPointerMove(event: React.PointerEvent<HTMLDivElement>) {
		if (sliderDragging) setIndex(indexFromSliderX(event.clientX));
	}

	return (
		<div className="flex w-full max-w-3xl flex-col items-center gap-5 py-8 select-none">
			<div className="relative px-6">
				<span
					className={`font-script text-5xl italic transition-all ${powered ? "text-white" : "text-neutral-600"}`}
					style={{
						textShadow: powered ? `0 0 24px ${station.accent}` : "none",
					}}
				>
					{station.name}
				</span>
				{powered && (
					<div
						className="absolute top-1/2 -z-10 h-8 w-full -translate-y-1/2 -skew-x-12 rounded-sm"
						style={{ background: station.accent, opacity: 0.85 }}
					/>
				)}
			</div>

			<div className="flex w-full items-center justify-center">
				<div className="w-12 shrink-0" />
				<Chevron direction="left" onClick={() => step(-1)} />
				<div
					className={`overflow-hidden py-2 ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
					style={{ width: VIEWPORT_WIDTH, touchAction: "pan-y" }}
					onPointerDown={onPointerDown}
					onPointerMove={onPointerMove}
					onPointerUp={onPointerUp}
					onPointerCancel={onPointerUp}
				>
					<div
						className={`flex ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
						style={{ gap: CARD_GAP, transform: `translateX(${offset}px)` }}
					>
						{stations.map((s, i) => (
							<button
								key={s.id}
								type="button"
								data-station-index={i}
								onClick={() => setIndex(i)}
								aria-label={s.name}
								className="shrink-0 cursor-pointer"
							>
								<StationLogo
									station={s}
									selected={i === index}
									dimmed={!powered}
								/>
							</button>
						))}
					</div>
				</div>
				<Chevron direction="right" onClick={() => step(1)} />
				<div className="flex w-12 shrink-0 items-center justify-center">
					<button
						type="button"
						onClick={() => setPowered((p) => !p)}
						aria-label={powered ? "Desligar rádio" : "Ligar rádio"}
						className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl transition-colors ${
							powered
								? "border-white bg-white/10 text-white"
								: "border-neutral-500 text-neutral-300 hover:border-white hover:text-white"
						}`}
					>
						⏻
					</button>
				</div>
			</div>

			<div className="flex w-72 items-center gap-6">
				<ShoulderButton label="L1" onClick={() => step(-1)} />
				<div
					ref={sliderTrackRef}
					className={`relative flex-1 py-2 ${sliderDragging ? "cursor-grabbing" : "cursor-pointer"}`}
					style={{ touchAction: "none" }}
					onPointerDown={onSliderPointerDown}
					onPointerMove={onSliderPointerMove}
					onPointerUp={() => setSliderDragging(false)}
					onPointerCancel={() => setSliderDragging(false)}
				>
					<div className="h-0.5 bg-neutral-500" />
					<div
						className={`absolute top-1/2 h-2 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-300 ${sliderDragging ? "" : "transition-all duration-150"}`}
						style={{ left: `${(index / (stations.length - 1)) * 100}%` }}
					/>
				</div>
				<ShoulderButton label="R1" onClick={() => step(1)} />
			</div>

			<div className="text-center font-hud tracking-wide text-white uppercase">
				<p className="text-2xl font-medium">{station.frequency}</p>
				<p className="text-lg text-neutral-400">
					{powered ? station.genre : "RÁDIO DESLIGADO"}
				</p>
			</div>

			{powered ? null : (
				<div className="flex h-24 w-full max-w-md items-center justify-center rounded-xl border border-dashed border-neutral-800 font-hud tracking-widest text-neutral-600 uppercase">
					Aperte ⏻ para ligar o rádio
				</div>
			)}
			<SpotifyPreviewGate station={station} powered={powered} />
		</div>
	);
}
