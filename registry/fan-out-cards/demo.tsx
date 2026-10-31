/* eslint-disable @next/next/no-img-element */
import { FanOutCards, type FanOutCard } from "./fan-out-cards";

const insight = (text: string, meta: string, photo: string) => (
  <div className="flex items-stretch gap-3">
    <img src={`/demo/${photo}.jpg`} alt="" className="h-16 w-14 shrink-0 rounded-sm object-cover" />
    <div className="flex min-w-0 flex-col justify-between">
      <p className="text-xs leading-snug">{text}</p>
      <p className="text-[11px] text-muted-foreground">{meta}</p>
    </div>
  </div>
);

const CARDS: FanOutCard[] = [
  { x: -30, y: -28, rotate: -6, content: insight("Your AAPL position is up 12%", "Live market", "fjord") },
  { x: 30, y: -28, rotate: 6, content: insight("You're on track to save $400 this month", "2 min ago", "canyon") },
  { x: -34, y: 4, rotate: 5, content: insight("Rebalancing opportunity detected", "1 hour ago", "coast") },
  { x: 34, y: 4, rotate: -5, content: insight("Portfolio hit a new all-time high", "3 hours ago", "valley") },
  { x: -26, y: 34, rotate: -4, content: insight("Dining spend is 18% lower than last month", "Yesterday", "field") },
  { x: 26, y: 34, rotate: 4, content: insight("Rent goes out in 3 days", "Reminder", "dunes") },
];

export default function FanOutCardsDemo() {
  return (
    <FanOutCards
      cards={CARDS}
      cardClassName="w-60"
      className="h-[520px] w-[900px]"
      center={<img src="/demo/city.jpg" alt="" className="h-72 w-52 rounded-3xl object-cover shadow-xl" />}
    />
  );
}
