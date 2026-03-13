import type { FastifyInstance } from "fastify";
import crypto from "node:crypto";
import { z } from "zod";

export async function anonymousRoutes(fastify: FastifyInstance) {

	const bodySchema = z.object({
		userId: z.string().uuid(),
		threadId: z.string().uuid(),
		password: z.string().min(1), 
	});

	
	const animals = [
		"Tiger", "Wolf", "Falcon", "Panther", "Phoenix", "Leopard", "Eagle", "Raven",
		"Cobra", "Viper", "Hawk", "Dragon", "Lynx", "Jaguar", "Shark", "Stallion",
		"Owl", "Rhino", "Bear", "Panda", "Griffin", "Kraken", "Hydra", "Fox",
		"Bison", "Cheetah", "Gorilla", "Turtle", "Scorpion", "Mantis",
	];

	const adjectives = [
		"Shadow", "Silent", "Ghost", "Crimson", "Blue", "Iron", "Night", "Frost",
		"Storm", "Electric", "Golden", "Cyber", "Wild", "Atomic", "Nebula", "Lunar",
		"Solar", "Thunder", "Noble", "Brave", "Swift", "Hidden", "Obsidian", "Phantom",
		"Radiant", "Mystic", "Silver", "Scarlet", "Feral", "Arcane",
	];

	fastify.post("/anon-name", async (request, reply) => {
		const parsed = bodySchema.safeParse(request.body);

		if (!parsed.success) {
			return reply.status(400).send({
				success: false,
				error: "Invalid userId, threadId, or password",
			});
		}

		const { userId, threadId, password } = parsed.data;

		try {
			const seed = `${userId}-${threadId}`;

			const hash = crypto
				.createHmac("sha256", password)
				.update(seed)
				.digest("hex");

			const adjIndex = parseInt(hash.substring(0, 8), 16) % adjectives.length;
			const animalIndex = parseInt(hash.substring(8, 16), 16) % animals.length;
			const num = parseInt(hash.substring(16, 20), 16) % 100;

			const anonName = `${adjectives[adjIndex]}${animals[animalIndex]}${num}`;

			return reply.status(200).send({
				success: true,
				anonName,
			});
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({
				success: false,
				error: "Server error generating anonymous name",
			});
		}
	});
}
