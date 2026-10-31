import { Notch } from "./notch";

export default function NotchDemo() {
  return (
    <div className="relative h-56 w-full max-w-md overflow-hidden rounded-3xl bg-[url(/demo/valley.jpg)] bg-cover bg-center">
      <Notch delay={0.2}>
        <span className="text-2xl font-medium text-foreground">ARMOUR</span>
      </Notch>
    </div>
  );
}
