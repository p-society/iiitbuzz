import { Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import "@/styles/components/card.css";

const Footer = () => {
	return (
		<footer className="bg-background border-t-4 border-primary py-12 transition-colors duration-500">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
					<div className="col-span-1 md:col-span-2">
						<div className="flex items-center space-x-2 mb-4">
							<div className="w-8 h-8 bg-secondary border-2 border-primary pixel-pulse"></div>
							<h3 className="pixel-font text-xl text-primary">IIITBuzz</h3>
						</div>
						<p className="text-sm text-muted mb-4">
							The ultimate community platform for IIIT students. Connect, learn,
							and grow together in our vibrant digital campus ecosystem.
						</p>
						<div className="flex space-x-4">
							<a
								href="https://www.linkedin.com/company/p-soc"
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 neo-brutal-card bg-muted border-border flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all"
							>
								<Linkedin className="text-foreground w-4 h-4" />
							</a>

							<a
								href="mailto:tech-society@eiiit-bh.ac.in"
								className="w-8 h-8 neo-brutal-card bg-muted border-border flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-primary hover:text-primary-foreground transition-all"
							>
								<Mail className="text-foreground w-4 h-4" />
							</a>

							<a
								href="https://twitter.com/psociiit"
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 neo-brutal-card bg-muted border-border flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-secondary hover:text-secondary-foreground transition-all"
							>
								<Twitter className="text-foreground w-4 h-4" />
							</a>

							<a
								href="https://www.instagram.com/psoc_iiitbh"
								target="_blank"
								rel="noopener noreferrer"
								className="w-8 h-8 neo-brutal-card bg-muted border-border flex items-center justify-center cursor-pointer hover:scale-110 hover:bg-accent hover:text-accent-foreground transition-all"
							>
								<Instagram className="text-foreground w-4 h-4" />
							</a>
						</div>
					</div>

					<div>
						<h4 className="pixel-font text-sm text-primary mb-4">
							QUICK LINKS
						</h4>
						<ul className="space-y-2 text-sm">
							{["About Us", "Features", "Contact", "Help & Support"].map(
								(link) => (
									<li key={link}>
										<a
											href={`#${link.toLowerCase().replace(/ & | /g, "-")}`}
											className="text-muted hover:text-primary transition-colors"
										>
											{link}
										</a>
									</li>
								),
							)}
						</ul>
					</div>

					<div>
						<h4 className="pixel-font text-sm text-primary mb-4">POLICIES</h4>
						<ul className="space-y-2 text-sm">
							{[
								"Privacy Policy",
								"Terms of Service",
								"Community Guidelines",
								"Cookie Policy",
							].map((policy) => (
								<li key={policy}>
									<a
										href={`#${policy.toLowerCase().replace(/ /g, "-")}`}
										className="text-muted hover:text-primary transition-colors"
									>
										{policy}
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="border-t-2 border-muted pt-8 text-center">
					<p className="pixel-font text-xs text-muted m-4">© 2025 IIITBuzz</p>
					<p className="text-xs text-muted mt-2">by- P-Soc IIIT-bh</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
