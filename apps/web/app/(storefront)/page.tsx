import { PROJECT_NAME } from "@abigail/shared";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 p-8 py-24">
      <h1 className="text-4xl font-bold">{PROJECT_NAME}</h1>
      <p className="text-lg text-muted-foreground">
        Monorepo sanity check — this string comes from{" "}
        <code className="rounded bg-muted px-2 py-1 font-mono text-sm">@abigail/shared</code>
      </p>
    </section>
  );
}
