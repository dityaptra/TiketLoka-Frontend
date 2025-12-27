import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="relative group overflow-hidden bg-[#F57C00] p-6 rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:-rotate-1 hover:shadow-xl hover:shadow-orange-500/40 border border-orange-400/20">
    <div className="absolute inset-0 opacity-10" 
         style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
    </div>
    <div className="absolute -bottom-4 -right-4 text-white opacity-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
      <Icon size={100} strokeWidth={1.5} />
    </div>
    <div className="relative z-10 flex flex-col h-full">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-orange-600/20 transition-transform duration-300 group-hover:scale-110">
        <Icon size={24} className="text-[#F57C00]" strokeWidth={2.5} />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-orange-50 text-sm font-medium leading-relaxed opacity-90">
        {description}
      </p>
    </div>
  </div>
);

export default FeatureCard;