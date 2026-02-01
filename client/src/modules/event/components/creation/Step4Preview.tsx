import React from 'react';
import { LayoutList, Calendar, MapPin, Instagram, Globe } from 'lucide-react';
import { EventForm } from '../../types';

interface Step4Props {
    form: EventForm;
    currencySymbol: string;
    daysLeft: number | null;
    deadlineStyles: { base: string; glow: string; text: string };
}

const Step4Preview: React.FC<Step4Props> = ({
    form,
    currencySymbol,
    daysLeft,
    deadlineStyles
}) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <LayoutList size={24} className="text-primary-400" />
                    Visual Preview Cards
                </h2>
                <div className="text-xs text-dark-500 bg-dark-800 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest font-bold">
                    Summary
                </div>
            </div>

            {/* Premium Flyer Preview */}
            <div className="relative group max-w-[500px] mx-auto overflow-hidden rounded-[2.5rem] border-8 border-dark-900 shadow-2xl shadow-primary-500/10 transition-all duration-500 hover:shadow-primary-500/20">
                {/* Main Flyer Content */}
                <div className="aspect-[4/5] bg-dark-950 relative flex flex-col overflow-hidden text-center">
                    {/* Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary-600/20 via-transparent to-dark-950/90 z-0" />
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none grayscale brightness-50 z-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                    {/* Content Wrapper */}
                    <div className="relative z-10 flex flex-col h-full p-8">
                        {/* Header */}
                        <div className="mb-6 space-y-1">
                            <div className="inline-block px-4 py-1 rounded-full bg-primary-500 text-[10px] font-black tracking-[0.2em] text-black uppercase mb-2">
                                Archery Competition
                            </div>
                            <h1 className="text-3xl font-display font-black leading-tight text-white uppercase tracking-tight">
                                {form.name || "Event Name"}
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-primary-400 font-bold tracking-widest uppercase text-[10px]">
                                <div className="h-px w-6 bg-primary-500/30" />
                                <span>{form.level} • {form.fieldType}</span>
                                <div className="h-px w-6 bg-primary-500/30" />
                            </div>
                        </div>

                        {/* Top Info Bar (Dates and Venue) */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center justify-center">
                                <div className="text-primary-400 uppercase text-[10px] font-black tracking-widest mb-1 flex items-center gap-1">
                                    <Calendar size={12} /> Schedule
                                </div>
                                <p className="text-sm font-black text-white whitespace-nowrap uppercase">
                                    {form.startDate ? new Date(form.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'} - {form.endDate ? new Date(form.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '---'}
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center justify-center text-center">
                                <div className="text-primary-400 uppercase text-[10px] font-black tracking-widest mb-1 flex items-center gap-1">
                                    <MapPin size={12} /> Venue
                                </div>
                                <p className="text-xs font-bold text-white leading-tight line-clamp-2 uppercase">
                                    {form.venue || "TBA"}
                                </p>
                            </div>
                        </div>

                        {/* Fee Section */}
                        <div className="bg-dark-900/80 rounded-2xl p-4 border border-white/5 mb-3 relative overflow-hidden group/fees">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="text-primary-400 uppercase text-[9px] font-black tracking-widest">Entry Registration Fees</div>
                                <div className="text-[9px] text-dark-500 font-bold uppercase tracking-tight">{form.currency} ({currencySymbol})</div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center">
                                    <div className="text-[9px] font-bold text-dark-400 uppercase mb-0.5">Individual</div>
                                    <div className="text-sm font-black text-white">{currencySymbol} {form.feeIndividual > 0 ? form.feeIndividual.toLocaleString() : '---'}</div>
                                </div>
                                <div className="text-center border-x border-white/5">
                                    <div className="text-[9px] font-bold text-dark-400 uppercase mb-0.5">Team</div>
                                    <div className="text-sm font-black text-white">{currencySymbol} {form.feeTeam > 0 ? form.feeTeam.toLocaleString() : '---'}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[9px] font-bold text-dark-400 uppercase mb-0.5">Mix Team</div>
                                    <div className="text-sm font-black text-white">{currencySymbol} {form.feeMixTeam > 0 ? form.feeMixTeam.toLocaleString() : '---'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Categories Summary - Maximized Space */}
                        <div className="flex-1 flex flex-col gap-2 overflow-hidden text-center min-h-0">
                            <div className="flex flex-wrap justify-center gap-2 overflow-y-auto max-h-[220px] scrollbar-hide py-1">
                                {form.competitionCategories.length > 0 ? (
                                    Array.from(new Map(
                                        form.competitionCategories.map(cat => [
                                            `${cat.division}-${cat.ageClass}-${cat.distance}-${cat.categoryLabel || ''}`,
                                            cat
                                        ])
                                    ).values()).slice(0, 15).map((cat, i) => (
                                        <div key={i} className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center min-w-[90px] shadow-lg hover:bg-white/10 transition-colors">
                                            <div className="text-[10px] font-black text-white uppercase leading-none mb-1">{cat.division}</div>
                                            <div className="text-[8px] font-bold text-primary-400 uppercase tracking-tight">{cat.ageClass} • {cat.distance}</div>
                                            {cat.categoryLabel && <div className="text-[7px] text-dark-500 font-bold uppercase mt-0.5 line-clamp-1">{cat.categoryLabel}</div>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-dark-500 italic text-center w-full py-4">No Categories Added</div>
                                )}
                                {(() => {
                                    const uniqueCount = new Set(form.competitionCategories.map(cat => `${cat.division}-${cat.ageClass}-${cat.distance}-${cat.categoryLabel || ''}`)).size;
                                    return uniqueCount > 15 && (
                                        <div className="px-3 py-1.5 rounded-xl bg-primary-500/10 border border-primary-400/20 text-[8px] font-black text-primary-400 uppercase flex items-center">
                                            +{uniqueCount - 15} More
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                            <div className="flex items-center justify-center gap-6">
                                {form.instagram && (
                                    <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                                            <Instagram size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-dark-300">{form.instagram}</span>
                                    </div>
                                )}
                                {form.website && (
                                    <div className="flex items-center gap-1.5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all">
                                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <Globe size={12} />
                                        </div>
                                        <span className="text-[10px] font-bold text-dark-300">Website</span>
                                    </div>
                                )}
                            </div>

                            <div className={`${deadlineStyles.base} ${deadlineStyles.glow} p-4 rounded-2xl flex items-center justify-between ${deadlineStyles.text} relative overflow-hidden group/cta transition-all duration-700`}>
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-1000" />
                                <div className="text-left relative z-10">
                                    <p className="text-[8px] font-black uppercase opacity-60">Deadline</p>
                                    <p className="text-[10px] font-black uppercase">{form.registrationDeadline ? new Date(form.registrationDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'N/A'}</p>
                                </div>

                                {/* Middle Countdown */}
                                <div className="flex flex-col items-center justify-center px-4 border-x border-black/10 relative z-10 mx-auto">
                                    <span className="text-xl font-black leading-none">{daysLeft !== null ? daysLeft : '--'}</span>
                                    <span className="text-[6px] font-black uppercase opacity-60">Days Left</span>
                                </div>

                                <div className="text-right flex-1 relative z-10">
                                    <p className="text-[8px] font-black uppercase opacity-60">Secure Slot</p>
                                    <p className="text-[10px] font-black uppercase">sip-panahan.id</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Glass Overlay Effects */}
                <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="absolute top-4 right-4 pointer-events-none">
                    <div className="w-20 h-20 bg-primary-500/30 blur-3xl rounded-full" />
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm text-dark-500 italic max-w-sm mx-auto">
                    This is a generated preview. Your actual flyer asset ({form.eFlyer instanceof File ? form.eFlyer.name : (form.eFlyer || 'None')}) will be attached to the event listing.
                </p>
            </div>
        </div>
    );
};

export default Step4Preview;
