import { PeekCard } from "./peek-card";


export default function PeekCardDemo() {
  return (
    <div className="grid w-full max-w-5xl gap-6">
      <div className="grid grid-cols-3 gap-6">
        <PeekCard
          index={1}
          image="/demo/canal.jpg"
          title="Mapping the old town"
          description="A walk through the lanes nobody has drawn yet, with a map at the end."
          meta={
            <>
              <span>Sat, 12 Oct · 10:00</span>
              <span>Old Town Square</span>
            </>
          }
          href="#one"
        />
        <PeekCard
          index={2}
          image="/demo/city.jpg"
          title="Night ride"
          description="Ten kilometres of lit streets, a group pace and a stop for chai."
          meta="Fri, 18 Oct · 21:00"
          href="#two"
        />
        <PeekCard
          index={3}
          image="/demo/hiker.jpg"
          imgProps={{ alt: "Hills at sunset" }}
          title="Hill trail cleanup"
          description="Bring gloves; we bring the bags."
          meta="Sun, 20 Oct"
          href="#three"
        />
      </div>
      <PeekCard
        variant="row"
        index="12 Oct"
        image="/demo/field.jpg"
        title="Mapping the old town"
        description="A walk through the lanes nobody has drawn yet."
        meta={<span>@Old Town Square</span>}
        href="#row"
      />
      <PeekCard variant="row" muted title="Last month's meetup" description="This one is over. Thanks for coming." meta={<span>Closed</span>} href="#past" />
    </div>
  );
}
