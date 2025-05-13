
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const benefitsData = [
  {
    title: "For Students",
    description: "Access comprehensive learning resources, tutorials, and practical projects to build in-demand GIS skills. Connect with industry professionals and discover job opportunities."
  },
  {
    title: "For Geospatial Professionals",
    description: "Enhance your career with advanced analysis tools, collaborative projects, and continuous learning. Showcase your expertise and connect with potential employers."
  },
  {
    title: "For Companies",
    description: "Find skilled GIS professionals, access cutting-edge spatial analysis tools, and leverage dashboards for informed decision-making. Scale your geospatial capabilities efficiently."
  },
  {
    title: "For Government Officials",
    description: "Make data-driven decisions with customized geo-dashboards, access spatial analysis tools, and find qualified professionals for public sector GIS projects."
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <h2 className="text-3xl font-bold text-center mb-12">How HaritaHive Helps You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefitsData.map((benefit, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <CardTitle>{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
