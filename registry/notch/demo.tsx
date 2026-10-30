import { Notch } from "./notch";

export default function NotchDemo() {
  return (
    <div className="relative h-56 w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-sky-700 to-sky-300">
      <Notch delay={0.2}>
        <span className="text-2xl font-medium text-foreground">ARMOUR</span>
      </Notch>
    </div>
  );
}
