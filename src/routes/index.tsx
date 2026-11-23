import { createFileRoute } from "@tanstack/react-router";
import { RadioPanel } from "../components/radio-panel";

export const Route = createFileRoute("/")({ component: Home });

function GitHubIcon() {
	return (
		<svg
			role="img"
			aria-label="GitHub"
			viewBox="0 0 24 24"
			className="h-4 w-4 fill-current"
		>
			<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
		</svg>
	);
}

function Home() {
	return (
		<main className="flex min-h-screen flex-col bg-[#0a0a0c] bg-[radial-gradient(ellipse_at_center,#14141a_0%,#0a0a0c_70%)]">
			<header className="flex items-center justify-center gap-3 pt-6">
				<img
					src="/logo.svg"
					alt="GTA VI Radio"
					className="h-14 w-14 drop-shadow-[0_0_12px_rgba(229,92,138,0.45)]"
				/>
				<span className="font-hud text-lg font-medium tracking-[0.3em] text-neutral-300 uppercase">
					GTA VI Radio
				</span>
			</header>
			<div className="flex flex-1 items-center justify-center">
				<RadioPanel />
			</div>
			<footer className="flex w-full items-center justify-center gap-2 pb-4 text-sm text-neutral-500">
				<img src="/logo.svg" alt="Logo" className="h-4 w-4" />
				<span>Criado por izakdvlpr</span>
				<span aria-hidden="true">·</span>
				<a
					href="https://github.com/izakdvlpr/gta6-radio-preview"
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-1.5 transition-colors hover:text-white"
				>
					<GitHubIcon />
					GitHub
				</a>
			</footer>
		</main>
	);
}
