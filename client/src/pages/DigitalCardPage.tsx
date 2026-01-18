import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DigitalIDCard, { IDCardData } from '../components/DigitalIDCard';

export default function DigitalCardPage() {
    const { user } = useAuth();

    // Sample ID Card data (would come from user profile in production)
    const idCardData: IDCardData = {
        sipId: '03.3174.0001',
        name: user?.name || 'Unknown',
        role: user?.role || 'ATHLETE',
        status: 'ACTIVE',
        verifiedBy: 'Jakarta Archery Club',
        verifiedAt: new Date('2024-01-15'),
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Digital ID Card</h1>
                    <p className="text-dark-400">Your official SIP identification card</p>
                </div>
            </motion.div>

            {/* ID Card Display */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-4">Your ID Card</h2>
                <p className="text-sm text-dark-400 mb-6">
                    Tap the card to flip and see more details. Use the export button to download a print-ready version.
                </p>

                <div className="flex justify-center">
                    <DigitalIDCard data={idCardData} className="max-w-sm w-full" showExport={true} />
                </div>
            </motion.div>

            {/* Card Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
            >
                <h2 className="text-lg font-semibold mb-4">Card Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-dark-800/50 rounded-lg p-4">
                        <p className="text-xs text-dark-400 mb-1">SIP ID Format</p>
                        <p className="font-mono text-lg">XX.XXXX.XXXX</p>
                        <p className="text-xs text-dark-500 mt-2">Role Code . Province+City . Serial</p>
                    </div>
                    <div className="bg-dark-800/50 rounded-lg p-4">
                        <p className="text-xs text-dark-400 mb-1">Print Specifications</p>
                        <p className="text-sm">8.56 × 5.40 cm (CR80)</p>
                        <p className="text-xs text-dark-500 mt-2">300 DPI • 1011 × 638 px</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
