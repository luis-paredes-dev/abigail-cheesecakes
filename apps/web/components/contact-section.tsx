import type { LucideIcon } from "lucide-react";
import { Camera, Mail, MessageCircle, Music } from "lucide-react";

import { CONTACT_CHANNELS, formatWhatsappNumber, getWhatsappNumber } from "@/lib/contact";

type Channel = {
  name: string;
  icon: LucideIcon;
  /** What's shown, e.g. "@abigailscheesecakes". Null shows "Coming soon". */
  label: string | null;
  href: string | null;
};

function buildChannels(): Channel[] {
  const whatsapp = getWhatsappNumber();
  const { instagramHandle, tiktokHandle, email } = CONTACT_CHANNELS;

  return [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      label: whatsapp ? formatWhatsappNumber(whatsapp) : null,
      href: whatsapp ? `https://wa.me/${whatsapp}` : null,
    },
    {
      name: "Instagram",
      icon: Camera,
      label: instagramHandle ? `@${instagramHandle}` : null,
      href: instagramHandle ? `https://www.instagram.com/${instagramHandle}/` : null,
    },
    {
      name: "TikTok",
      icon: Music,
      label: tiktokHandle ? `@${tiktokHandle}` : null,
      href: tiktokHandle ? `https://www.tiktok.com/@${tiktokHandle}` : null,
    },
    {
      name: "Email",
      icon: Mail,
      label: email,
      href: email ? `mailto:${email}` : null,
    },
  ];
}

export function ContactSection() {
  const channels = buildChannels();

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-5xl px-4 py-16"
    >
      <h2 id="contact-heading" className="text-2xl font-bold">
        Get in touch
      </h2>
      <p className="mt-2 text-muted-foreground">The quickest way to reach Abigail is WhatsApp.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((channel) => {
          const Icon = channel.icon;
          const isExternal = channel.href?.startsWith("http");

          return (
            <li key={channel.name} className="flex items-start gap-3 rounded-xl border bg-card p-4">
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h3 className="font-semibold">{channel.name}</h3>
                {channel.href && channel.label ? (
                  <a
                    href={channel.href}
                    className="text-sm break-words underline-offset-4 hover:underline"
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {channel.label}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
