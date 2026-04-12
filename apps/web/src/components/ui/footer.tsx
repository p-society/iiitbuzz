import { Instagram, Linkedin, Mail, Twitter } from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-background border-t-4 border-primary">
			<div className="site-container py-4">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<img
								src="/images/logo.png"
								alt="IIITBuzz Logo"
								className="w-6 h-6"
							/>
							<span className="pixel-font text-sm text-primary">IIITBuzz</span>
						</div>
						<div className="flex gap-3">
							<a
								href="https://www.linkedin.com/company/p-soc"
								target="_blank"
								rel="noopener noreferrer"
								className="w-6 h-6 border-2 border-black flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
							>
								<Linkedin className="w-3 h-3" />
							</a>
							<a
								href="mailto:tech-society@eiiit-bh.ac.in"
								className="w-6 h-6 border-2 border-black flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
							>
								<Mail className="w-3 h-3" />
							</a>
							<a
								href="https://twitter.com/psociiit"
								target="_blank"
								rel="noopener noreferrer"
								className="w-6 h-6 border-2 border-black flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
							>
								<Twitter className="w-3 h-3" />
							</a>
							<a
								href="https://www.instagram.com/psoc_iiitbh"
								target="_blank"
								rel="noopener noreferrer"
								className="w-6 h-6 border-2 border-black flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
							>
								<Instagram className="w-3 h-3" />
							</a>
						</div>
					</div>
					<div className="flex flex-wrap gap-4 text-xs font-bold">
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
				<div className="border-t-2 border-black mt-3 py-2 text-center">
					<p className="text-[10px] font-bold text-muted-foreground">
						© 2025 IIITBuzz · by P-Soc IIIT-bh
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
