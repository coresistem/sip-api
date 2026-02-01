import React from 'react';
import { Settings, Tag, Users, Image, FileText } from 'lucide-react';
import SearchableSelect from '@/modules/core/components/ui/SearchableSelect';
import { currencies } from '@/modules/core/data/currencies';
import { EventForm } from '../../types';

interface Step3Props {
    form: EventForm;
    updateForm: (field: keyof EventForm, value: any) => void;
}

const Step3Details: React.FC<Step3Props> = ({ form, updateForm }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-primary-400" />
                <h2 className="text-xl font-bold text-white">Registration & Details</h2>
            </div>

            {/* Registration Fees, Social, Files */}
            <div className="space-y-6">
                {/* Registration Fees */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Registration Fees
                    </h3>

                    <div>
                        <label className="label mb-1 block">Currency</label>
                        <SearchableSelect
                            options={currencies.map(c => ({ value: c.code, label: `${c.code} - ${c.name} (${c.symbol})` }))}
                            value={form.currency}
                            onChange={(val) => updateForm('currency', val)}
                            placeholder="Select Currency"
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Individual Fee</label>
                            <input
                                type="number"
                                value={form.feeIndividual}
                                onChange={(e) => updateForm('feeIndividual', parseInt(e.target.value) || 0)}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="label">Team Fee</label>
                            <input
                                type="number"
                                value={form.feeTeam}
                                onChange={(e) => updateForm('feeTeam', parseInt(e.target.value) || 0)}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="label">Mixed Team Fee</label>
                            <input
                                type="number"
                                value={form.feeMixTeam}
                                onChange={(e) => updateForm('feeMixTeam', parseInt(e.target.value) || 0)}
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="label">Official Fee</label>
                            <input
                                type="number"
                                value={form.feeOfficial}
                                onChange={(e) => updateForm('feeOfficial', parseInt(e.target.value) || 0)}
                                className="input w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media & Contact */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" /> Social & Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Instagram</label>
                            <input
                                type="text"
                                value={form.instagram}
                                onChange={(e) => updateForm('instagram', e.target.value)}
                                placeholder="@username"
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label className="label">Website</label>
                            <input
                                type="text"
                                value={form.website}
                                onChange={(e) => updateForm('website', e.target.value)}
                                placeholder="https://..."
                                className="input w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Files */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Documents
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">e-Flyer</label>
                            <div className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            updateForm('eFlyer', file);
                                        }
                                    }}
                                />
                                <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                                    <Image className="w-4 h-4" />
                                </div>
                                <span className="text-xs text-dark-400 group-hover:text-white truncate block px-2">
                                    {form.eFlyer instanceof File ? form.eFlyer.name : form.eFlyer || "Upload Image"}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="label">Technical Handbook (THB)</label>
                            <div className="relative border border-dashed border-white/20 rounded-lg p-4 text-center hover:bg-white/5 transition-colors cursor-pointer group">
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            updateForm('technicalHandbook', file);
                                        }
                                    }}
                                />
                                <div className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className="text-xs text-dark-400 group-hover:text-white truncate block px-2">
                                    {form.technicalHandbook instanceof File ? form.technicalHandbook.name : form.technicalHandbook || "Upload Document"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step3Details;
