import { LayeredMenu } from "./layered-menu";

export default function LayeredMenuDemo() {
  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-sky-700 to-sky-300">
      <LayeredMenu
        contained
        delay={0.2}
        logo={<span className="font-medium tracking-tight">ARMOUR</span>}
        primary={[
          { label: "Experience", href: "#experience" },
          { label: "Technology", href: "#technology" },
          { label: "Company", href: "#company" },
        ]}
        secondary={[
          { label: "Features", href: "#features" },
          { label: "FAQ", href: "#faq" },
        ]}
      />
    </div>
  );
}
