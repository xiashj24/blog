Done:

Astro v6 blog scaffolded with your title ("Shijie Xia"), site URL (https://www.xiashj.com), and RSS feed
Svelte + Tailwind v4 integrated — ready for interactive components
Header/footer cleaned up (removed Astro placeholder links)
.github/workflows/deploy.yml — push to main → build → rsync to your server
Caddyfile — serves dist/ at www.xiashj.com, redirects bare domain to www
To do before first deploy:

Create GitHub repo, push this code
On your Vultr server: apt install caddy, create /var/www/blog, copy the Caddyfile to /etc/caddy/Caddyfile, run systemctl start caddy
Generate a deploy SSH key (ssh-keygen -t ed25519), add the public key to ~/.ssh/authorized_keys on the server
Add three GitHub repo secrets: SSH_PRIVATE_KEY, SERVER_HOST (your server IP), SERVER_USER
Update the description in src/consts.ts to something personal
To write your first real post: add a .md file to src/content/blog/ — the sample posts in there show the frontmatter format.