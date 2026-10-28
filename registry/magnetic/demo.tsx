import { Magnetic } from "./magnetic";

export default function MagneticDemo() {
  return (
    <div className="grid h-64 place-items-center">
      <Magnetic strength={0.6}>
        <button type="button" className="rounded-full bg-foreground px-6 py-3 text-background">
          Move your mouse over me
        </button>
      </Magnetic>
    </div>
  );
}
