import { FitTitle } from "./fit-title";

export default function FitTitleDemo() {
  return (
    <div className="grid w-[440px] gap-4">
      <FitTitle className="font-semibold">shop</FitTitle>
      <FitTitle as="p" className="text-muted-foreground">
        Summer collection
      </FitTitle>
    </div>
  );
}
