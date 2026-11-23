import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "GTA VI Radio Preview",
			},
			{
				name: "description",
				content:
					"Preview das estações de rádio do GTA VI com playlists reais do Spotify. Navegue pela roda de estações, ligue o rádio e escolha a música.",
			},
			{
				name: "keywords",
				content: "gta 6, gta vi, radio, spotify, preview, rockstar",
			},
			{
				name: "author",
				content: "izakdvlpr",
			},
			{
				property: "og:type",
				content: "website",
			},
			{
				property: "og:title",
				content: "GTA VI Radio Preview",
			},
			{
				property: "og:description",
				content:
					"Preview das estações de rádio do GTA VI com playlists reais do Spotify.",
			},
			{
				property: "og:image",
				content: "/og.png",
			},
			{
				name: "twitter:card",
				content: "summary_large_image",
			},
			{
				name: "twitter:title",
				content: "GTA VI Radio Preview",
			},
			{
				name: "twitter:description",
				content:
					"Preview das estações de rádio do GTA VI com playlists reais do Spotify.",
			},
			{
				name: "twitter:image",
				content: "/og.png",
			},
			{
				name: "theme-color",
				content: "#0a0a0c",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<script
					defer
					src="https://dataxamas.com/dataxamas.js"
					data-api-key="dx_live_xYdCk5tFPJ9SHrXfoxR2xBSABVJm3Sg0FW0hMAKqnBE"
					data-allow-localhost="true"
				></script>
				<Scripts />
			</body>
		</html>
	);
}
