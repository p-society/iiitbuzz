import { Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import logo from "../../../../../assets/logo.png";

const Footer = () => {
	return (
		<footer className="bg-background border-t border-border">
			<div className="site-container py-4">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<img src={logo} alt="IIITBuzz Logo" className="w-6 h-6" />
							<span className="font-black text-sm text-foreground tracking-tight">
								IIITBuzz
							</span>
						</div>
						<div className="flex gap-2">
							<a
								href="https://www.linkedin.com/company/p-soc"
								target="_blank"
								rel="noopener noreferrer"
								className="w-6 h-6 border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors"
							>
								<Linkedin className="w-3 h-3" />
							</a>
							<a
								href="mailto:tech-society@eiiit-bh.ac.in"
								className="w-6 h-6 border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors"
							>
								<Mail className="w-3 h-3" />
							</a>
							<a
								href="https://twitter.com/psociiit"
								target="_blank"
								rel="noopener noreferrer"
								className="w-6 h-6 border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors"
							>
								<Twitter className="w-3 h-3" />
							</a>
							<a
								href="https://www.instagram.com/psoc_iiitbh"
								target="_blank"
								rel="noopener noreferrer"
								className="w-6 h-6 border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-background transition-colors"
							>
								<Instagram className="w-3 h-3" />
							</a>
						</div>
					</div>
					<div className="flex flex-wrap gap-4 mono-meta">
						<a href="#about" className="hover:underline">
							About
						</a>
						<a href="#privacy" className="hover:underline">
							Privacy
						</a>
						<a href="#terms" className="hover:underline">
							Terms
						</a>
						<a href="#help" className="hover:underline">
							Help
						</a>
					</div>
				</div>
				<div className="border-t border-border mt-3 py-2 text-center">
					<p className="mono-meta text-[10px]">
						© 2026 IIITBuzz · by P-Soc IIIT-bh
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
