import { 
  Heart, 
  Baby, 
  Brain, 
  Eye, 
  Bone, 
  Dog,
  Sparkles,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SpecialtyModule } from '@/types/clinic';

interface ModuleInfo {
  id: SpecialtyModule;
  name: string;
  icon: React.ElementType;
  description: string;
  price: string;
  enabled: boolean;
  color: string;
}

const modules: ModuleInfo[] = [
  { 
    id: 'dentist', 
    name: 'Dentist', 
    icon: Sparkles, 
    description: 'Tooth charts, treatment stages, X-ray linking',
    price: '₹1,499/mo',
    enabled: true,
    color: 'from-cyan-500 to-blue-500'
  },
  { 
    id: 'cardiologist', 
    name: 'Cardiologist', 
    icon: Heart, 
    description: 'BP, ECG tracking, report comparison',
    price: '₹1,999/mo',
    enabled: true,
    color: 'from-red-500 to-pink-500'
  },
  { 
    id: 'pediatrician', 
    name: 'Pediatrician', 
    icon: Baby, 
    description: 'Vaccination schedule, growth charts',
    price: '₹1,299/mo',
    enabled: false,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'psychiatrist', 
    name: 'Psychiatrist', 
    icon: Brain, 
    description: 'Session notes, mood tracking, consent',
    price: '₹2,499/mo',
    enabled: false,
    color: 'from-purple-500 to-violet-500'
  },
  { 
    id: 'ophthalmologist', 
    name: 'Ophthalmologist', 
    icon: Eye, 
    description: 'Eye tests, lens prescriptions',
    price: '₹1,499/mo',
    enabled: false,
    color: 'from-amber-500 to-orange-500'
  },
  { 
    id: 'orthopedic', 
    name: 'Orthopedic', 
    icon: Bone, 
    description: 'Injury tracking, rehab scheduling',
    price: '₹1,799/mo',
    enabled: false,
    color: 'from-slate-500 to-gray-600'
  },
];

export function ModulesOverview() {
  return (
    <div className="bg-card rounded-xl shadow-md p-5 animate-slide-up" style={{ animationDelay: '250ms' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-semibold text-lg">Specialty Modules</h2>
          <p className="text-sm text-muted-foreground">Expand your clinic capabilities</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          Manage
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <div
              key={module.id}
              className={cn(
                'relative p-4 rounded-xl border transition-all duration-200',
                module.enabled
                  ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                  : 'border-border bg-secondary/30 hover:bg-secondary/50'
              )}
            >
              {!module.enabled && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br',
                  module.color
                )}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-medium text-sm">{module.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {module.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">{module.price}</span>
                {module.enabled ? (
                  <span className="text-xs text-success font-medium">Active</span>
                ) : (
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    Enable
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
