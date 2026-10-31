import { PhotoWordmark } from "./photo-wordmark";

export default function PhotoWordmarkDemo() {
  return (
    <footer className="w-[800px] overflow-hidden rounded-3xl border bg-card px-10 pt-10 text-card-foreground">
      <div className="grid grid-cols-3 gap-8 text-sm">
        <p className="font-medium">Armour</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>Shop</li>
          <li>Journal</li>
        </ul>
        <ul className="space-y-1 text-muted-foreground">
          <li>Instagram</li>
          <li>Contact</li>
        </ul>
      </div>
      <PhotoWordmark text="ARMOUR" src="/demo/field.jpg" className="mt-10 font-black tracking-tight" />
    </footer>
  );
}
