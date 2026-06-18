import { Award, Users, Globe, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const About = () => {
  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "We deliver exceptional tour experiences with professional guides and well-planned itineraries.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Supporting local communities and promoting sustainable tourism practices across Sri Lanka.",
    },
    {
      icon: Globe,
      title: "Sustainability",
      description: "Committed to eco-friendly tourism that preserves Sri Lanka's natural beauty for future generations.",
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Our love for Sri Lanka drives us to share its wonders with travelers from around the world.",
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6">About Smart Travel</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are passionate travel experts dedicated to showcasing the breathtaking beauty,
            rich culture, and warm hospitality of Sri Lanka to travelers from around the globe.
          </p>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-card h-full">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide authentic, memorable, and sustainable travel experiences that connect
                  visitors with the heart and soul of Sri Lanka. We strive to create journeys that
                  go beyond sightseeing, offering deep cultural immersion and personal growth.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-card h-full">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-sunset bg-clip-text text-transparent">
                  Our Vision
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To be the leading travel portal for Sri Lanka, recognized globally for excellence
                  in service, sustainability, and authentic experiences. We envision a future where
                  tourism enriches both travelers and local communities.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="shadow-card hover:shadow-glow transition-all h-full">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* About Sri Lanka */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Why Sri Lanka?</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Sri Lanka, often called the "Pearl of the Indian Ocean," is a land of extraordinary
                  diversity. From pristine beaches and lush tea plantations to ancient temples and
                  vibrant wildlife, this island nation offers experiences that captivate every traveler.
                </p>
                <p>
                  With over 2,500 years of recorded history, eight UNESCO World Heritage Sites, and
                  some of the warmest people you'll ever meet, Sri Lanka is a destination that stays
                  with you long after you've returned home.
                </p>
                <p>
                  Our expertly curated tours showcase the best of what Sri Lanka has to offer, whether
                  you're seeking adventure, cultural immersion, wildlife encounters, or simply relaxation
                  on golden beaches. Join us in discovering this incredible island paradise.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default About;