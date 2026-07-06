import { Preloader } from "@/components/landing/Preloader";
import { Hero } from "@/components/landing/Hero";
import { ScrollStory } from "@/components/landing/ScrollStory";
import { Rubric } from "@/components/landing/Rubric";
import { TechStack } from "@/components/landing/TechStack";
import { Cta } from "@/components/landing/Cta";
import { CustomCursor } from "@/components/landing/CustomCursor";

export default function LandingPage() {
  return (
    <>
      <Preloader />
      <CustomCursor />
      <Hero />
      <ScrollStory />
      <Rubric />
      <TechStack />
      <Cta />
    </>
  );
}
