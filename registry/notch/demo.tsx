import { Notch } from "./notch";

export default function NotchDemo() {
  return (
    // check-ignore: hardcoded-color Armour's brand blue under a white notch, in either theme
    <div className="relative h-56 w-full max-w-md overflow-hidden rounded-3xl bg-[#0E7DDA]">
      <Notch delay={0.2} color="#fff">
        {/* check-ignore: hardcoded-color dark type on the white notch, in either theme */}
        <span className="text-2xl font-medium text-[#1B1B1B]">ARMOUR</span>
      </Notch>
    </div>
  );
}
