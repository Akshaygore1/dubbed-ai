# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# architecture
- Never modify the worker/ directory; it runs separately as a Node.js background processor and is intentionally kept outside the main workspace. Confidence: 0.80
- Use Alchemy for Cloudflare infrastructure provisioning (Workers, Hyperdrive, R2 buckets, Queues). Confidence: 0.70

# auth
- Use Better Auth for authentication with the Admin plugin for admin role management. Confidence: 0.70

# design
- Prefer minimal, light-mode design with gallery-white canvas, ink-black typography, near-invisible structure, and media as the dominant visual material. Confidence: 0.70

