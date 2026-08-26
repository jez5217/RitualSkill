import Image from "next/image";

type RitualCrystalHeroProps = {
  priority?: boolean;
};

export default function RitualCrystalHero({ priority = false }: RitualCrystalHeroProps) {
  return (
    <div className="ritual-crystal-stage" aria-hidden="true">
      <div className="ritual-crystal-entry">
        <div className="ritual-crystal-float">
          <Image
            src="/images/ritual/ritual-floating-crystal.png"
            alt=""
            fill
            priority={priority}
            sizes="100vw"
            className="ritual-crystal-image"
          />
        </div>
      </div>

      <div className="ritual-crystal-overlay" />
    </div>
  );
}
