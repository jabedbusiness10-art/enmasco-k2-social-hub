export default function SocialLinks() {
  return (
    <ul className="mt-6 flex justify-center gap-4 text-neutral-400">
      {["Instagram", "Facebook", "TikTok", "X", "Snapchat"].map((name) => (
        <li
          key={name}
          className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-wide transition hover:border-white/30 hover:text-white"
        >
          {name}
        </li>
      ))}
    </ul>
  );
}
