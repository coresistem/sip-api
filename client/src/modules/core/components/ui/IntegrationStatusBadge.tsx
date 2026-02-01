import { Shield, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

type IntegrationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNLINKED';

interface IntegrationStatusBadgeProps {
    status: IntegrationStatus;
    orgName?: string; // e.g., "Eagle Archery Club"
    orgType?: string; // e.g., "Club", "School"
    size?: 'sm' | 'md' | 'lg';
}

export default function IntegrationStatusBadge({
    status,
    orgName = 'Organization',
    orgType = 'Club',
    size = 'md'
}: IntegrationStatusBadgeProps) {

    // Config based on status
    const config = {
        PENDING: {
            icon: Clock,
            color: 'amber',
            text: 'Waiting Approval',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            textColor: 'text-amber-400'
        },
        VERIFIED: {
            icon: CheckCircle2,
            color: 'green',
            text: 'Verified Member',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            textColor: 'text-green-400'
        },
        REJECTED: {
            icon: XCircle,
            color: 'red',
            text: 'Request Rejected',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            textColor: 'text-red-400'
        },
        UNLINKED: {
            icon: Shield,
            color: 'dark',
            text: 'No Affiliation',
            bg: 'bg-dark-800/50',
            border: 'border-dark-700',
            textColor: 'text-dark-400'
        }
    };

    const current = config[status] || config.UNLINKED;
    const Icon = current.icon;

    // Size variants
    const sizeClasses = {
        sm: 'px-2 py-1 text-[10px]',
        md: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2 text-sm'
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
                inline-flex items-center gap-2 rounded-full border font-bold uppercase tracking-wider
                ${current.bg} ${current.border} ${current.textColor} ${sizeClasses[size]}
            `}
            title={`${current.text} at ${orgName} (${orgType})`}
        >
            <Icon size={iconSizes[size]} />
            <span>
                {status === 'VERIFIED' ? `${orgName}` : current.text}
            </span>
        </motion.div>
    );
}
