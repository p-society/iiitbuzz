import type { Route } from "./+types/_index";

const TITLE_TEXT = `

░▒▓███████▓▒░        ░▒▓███████▓▒░       ░▒▓██████▓▒░        ░▒▓██████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░             ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░        
░▒▓███████▓▒░        ░▒▓██████▓▒░       ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░        
░▒▓█▓▒░                    ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░        
░▒▓█▓▒░                    ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░             ░▒▓███████▓▒░        ░▒▓██████▓▒░        ░▒▓██████▓▒░  
                                                                           
                                                                           
 `;

export function meta(_: Route.MetaArgs) {
	return [{ title: "PSOC" }, { name: "description", content: "My App" }];
}

export default function Dashboard() {
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">API Status</h2>
				</section>
			</div>
		</div>
	);
}
