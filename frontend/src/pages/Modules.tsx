import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Baby, 
  Brain, 
  Eye, 
  Bone, 
  Dog,
  Sparkles,
  Check,
  Lock,
  Crown,
  Zap,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpecialtyModule } from '@/types/clinic';

interface ModuleDetail {
  id: SpecialtyModule;
  name: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  price: number;
  enabled: boolean;
  color: string;
  popular?: boolean;
}

const modules: ModuleDetail[] = [
  { 
    id: 'dentist', 
    name: 'Dental Practice', 
    icon: Sparkles, 
    description: 'Complete dental clinic management with visual tooth charts and treatment tracking',
    features: [
      'Interactive tooth chart',
      'Treatment stage tracking (RCT, Braces, etc.)',
      'Per-tooth history',
      'X-ray image linking',
      'Recall reminders (6-12 months)',
      'Dental procedure templates'
    ],
    price: 1499,
    enabled: true,
    color: 'from-cyan-500 to-blue-500',
    popular: true
  },
  { 
    id: 'cardiologist', 
    name: 'Cardiology Suite', 
    icon: Heart, 
    description: 'Advanced cardiac patient management with vital tracking and trend analysis',
    features: [
      'BP & ECG tracking',
      'Cholesterol monitoring',
      'Report trend comparison',
      'Medication history',
      'Cardiac risk assessment',
      'Diagnostic follow-ups'
    ],
    price: 1999,
    enabled: true,
    color: 'from-red-500 to-pink-500'
  },
  { 
    id: 'pediatrician', 
    name: 'Pediatric Care', 
    icon: Baby, 
    description: 'Child-focused healthcare with vaccination scheduling and growth monitoring',
    features: [
      'Vaccination schedule management',
      'Auto vaccination reminders',
      'Growth charts (WHO standards)',
      'Child profiles under parent',
      'Milestone tracking',
      'Pediatric prescription templates'
    ],
    price: 1299,
    enabled: false,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'gynecologist', 
    name: 'OB-GYN Practice', 
    icon: Users, 
    description: 'Comprehensive womens health and pregnancy management system',
    features: [
      'Pregnancy timeline tracking',
      'Trimester-wise monitoring',
      'Lab report timeline',
      'Due date calculations & alerts',
      'Post-natal follow-ups',
      'Fetal development tracking'
    ],
    price: 1799,
    enabled: false,
    color: 'from-pink-500 to-rose-500'
  },
  { 
    id: 'psychiatrist', 
    name: 'Mental Health', 
    icon: Brain, 
    description: 'Secure psychiatric practice management with high confidentiality standards',
    features: [
      'Private session notes (encrypted)',
      'Mood tracking & journaling',
      'Session package management',
      'Tele-consult integration',
      'Digital consent management',
      'HIPAA-compliant storage'
    ],
    price: 2499,
    enabled: false,
    color: 'from-purple-500 to-violet-500'
  },
  { 
    id: 'ophthalmologist', 
    name: 'Eye Care', 
    icon: Eye, 
    description: 'Ophthalmology practice management with vision testing and prescription tracking',
    features: [
      'Eye test records',
      'Lens prescription history',
      'Visual acuity tracking',
      'Surgery follow-ups',
      'Contact lens management',
      'Retina scan storage'
    ],
    price: 1499,
    enabled: false,
    color: 'from-amber-500 to-orange-500'
  },
  { 
    id: 'orthopedic', 
    name: 'Orthopedics', 
    icon: Bone, 
    description: 'Musculoskeletal care management with injury tracking and rehabilitation',
    features: [
      'Injury tracking & documentation',
      'X-ray/MRI storage',
      'Rehab scheduling',
      'Pain scale tracking',
      'Physiotherapy integration',
      'Surgical outcome tracking'
    ],
    price: 1799,
    enabled: false,
    color: 'from-slate-500 to-gray-600'
  },
  { 
    id: 'veterinary', 
    name: 'Veterinary Care', 
    icon: Dog, 
    description: 'Complete pet clinic management with owner-pet linking and species-specific care',
    features: [
      'Pet profiles with species data',
      'Owner-pet linking',
      'Vaccination reminders',
      'Breed-specific history',
      'Multi-species support',
      'Pet insurance tracking'
    ],
    price: 1299,
    enabled: false,
    color: 'from-teal-500 to-cyan-500'
  },
];

export default function Modules() {
  const enabledCount = modules.filter(m => m.enabled).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Specialty Modules</h1>
          <p className="text-muted-foreground">Expand your clinic with specialty-specific features</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg">
            <span className="font-semibold">{enabledCount}</span> modules active
          </div>
        </div>
      </div>

      <div className="gradient-primary rounded-xl p-6 mb-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Professional Plan</h2>
              <p className="opacity-90">₹2,999/month + module fees • 2 modules included</p>
            </div>
          </div>
          <Button variant="glass" size="lg" className="gap-2">
            <Zap className="h-4 w-4" />
            Upgrade to Enterprise
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              className={cn(
                'relative bg-card rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                module.enabled && 'ring-2 ring-primary'
              )}
            >
              {module.popular && (
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full">
                  Popular
                </div>
              )}

              <div className="p-6">
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br',
                    module.color
                  )}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{module.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {module.features.slice(0, 4).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {module.features.length > 4 && (
                    <li className="text-sm text-muted-foreground pl-6">
                      +{module.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-display font-bold">₹{module.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {module.enabled ? (
                  <Button variant="outline" className="gap-2">
                    <Check className="h-4 w-4 text-success" />
                    Active
                  </Button>
                ) : (
                  <Button variant="gradient" className="gap-2">
                    Enable Module
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-card rounded-xl shadow-md p-8 text-center">
        <h2 className="font-display font-bold text-2xl mb-2">Need a Custom Solution?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Get unlimited modules, priority support, custom integrations, and dedicated account management with our Enterprise plan.
        </p>
        <Button variant="gradient" size="xl" className="gap-2">
          Contact Sales
        </Button>
      </div>
    </DashboardLayout>
  );
}
