import { motion } from 'framer-motion';
import { Shield, Target, AlertTriangle, Info } from 'lucide-react';

export default function ArcheryGuidancePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold">Archery Guidance</h1>
                <p className="text-dark-400">Safety guidelines and equipment recommendations</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Safety Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-dark-700 pb-4">
                        <div className="p-3 rounded-lg bg-red-500/20 text-red-500">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Safety in Archery</h2>
                            <p className="text-sm text-dark-400">Essential safety protocols</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <GuidanceItem
                            title="No Safety No Archery"
                            description="Always check the area around the target before shooting."
                            type="critical"
                        />
                        <GuidanceItem
                            title="Preparation Check"
                            description="Inspect your equipment (bowstring, limbs, arrows) before every session."
                            type="warning"
                        />
                        <GuidanceItem
                            title="Follow the Signal"
                            description="Strictly follow the coach's or whistle signals for shooting and retrieving."
                            type="info"
                        />
                        <GuidanceItem
                            title="Watch Your Back"
                            description="Be careful when pulling arrows; ensure no one is standing directly behind you."
                            type="warning"
                        />
                        <GuidanceItem
                            title="It's Forbidden"
                            description="Never point a bow at anyone, even without an arrow. Do not dry fire."
                            type="critical"
                        />
                    </div>
                </motion.div>

                {/* Equipment Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card p-6 space-y-6 block"
                >
                    <div className="flex items-center gap-3 border-b border-dark-700 pb-4">
                        <div className="p-3 rounded-lg bg-blue-500/20 text-blue-500">
                            <Target size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Equipment Preferences</h2>
                            <p className="text-sm text-dark-400">Gear recommendations</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <GuidanceItem
                            title="Bow Recommendation"
                            description="Choose a bow length based on your draw length (e.g., 66-70 inches)."
                            type="info"
                        />
                        <GuidanceItem
                            title="Arrow Selection (Standard)"
                            description="For Recurve/Barebow, match spine stiffness to your draw weight."
                            type="info"
                        />
                        <GuidanceItem
                            title="Arrow Selection (Compound)"
                            description="Stiffer spines are generally required for higher compound poundage."
                            type="info"
                        />
                        <GuidanceItem
                            title="Safety Accessories"
                            description="Arm guard, finger tab, and chest guard are mandatory for protection."
                            type="warning"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function GuidanceItem({ title, description, type }: { title: string; description: string; type: 'critical' | 'warning' | 'info' }) {
    const colors = {
        critical: 'border-l-red-500 bg-red-500/5',
        warning: 'border-l-amber-500 bg-amber-500/5',
        info: 'border-l-blue-500 bg-blue-500/5',
    };

    const icons = {
        critical: <AlertTriangle size={16} className="text-red-500 mt-0.5" />,
        warning: <AlertTriangle size={16} className="text-amber-500 mt-0.5" />,
        info: <Info size={16} className="text-blue-500 mt-0.5" />,
    };

    return (
        <div className={`p-3 border-l-2 rounded-r-lg ${colors[type]} flex gap-3`}>
            <div className="shrink-0">{icons[type]}</div>
            <div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-dark-300 mt-0.5">{description}</p>
            </div>
        </div>
    );
}
