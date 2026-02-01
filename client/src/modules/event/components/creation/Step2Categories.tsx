import React from 'react';
import { Users, Check, Trash2, Plus, FileText } from 'lucide-react';
import { EventForm, CompetitionCategoryItem } from '../../types';
import { CATEGORY_DIVISIONS, AGE_CLASSES, GENDERS, DISTANCES } from '../../constants';

interface Step2Props {
    form: EventForm;
    updateForm: (field: keyof EventForm, value: any) => void;
    editingId: string | null;
    newCategory: CompetitionCategoryItem;
    setNewCategory: React.Dispatch<React.SetStateAction<CompetitionCategoryItem>>;
    handleSaveCategory: () => void;
    removeCategory: (id: string) => void;
    editCategory: (cat: CompetitionCategoryItem) => void;
}

const Step2Categories: React.FC<Step2Props> = ({
    form,
    updateForm,
    editingId,
    newCategory,
    setNewCategory,
    handleSaveCategory,
    removeCategory,
    editCategory
}) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-400" />
                    <h2 className="text-xl font-bold text-white">Competition Categories</h2>
                </div>
                <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest bg-dark-900/50 px-3 py-1 rounded-lg border border-white/5 animate-pulse">
                    Double-click row to edit
                </div>
            </div>

            {/* CRUD Table */}
            <div className="bg-dark-800/50 rounded-xl overflow-hidden border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-xs text-dark-400 uppercase bg-primary-500/10 border-b border-primary-500/20">
                            <tr>
                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Division</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Age Class</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Gender</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle">Distance</th>
                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-white/5">Individu</th>
                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-white/5">Team</th>
                                <th colSpan={2} className="px-1 py-1 text-center border-r border-b border-white/5">Mix</th>
                                <th rowSpan={2} className="px-1 py-1 w-10 text-center border-r border-white/5 align-middle" title="Special Category">Sp</th>
                                <th rowSpan={2} className="px-3 py-2 border-r border-white/5 align-middle min-w-[120px]">Special Description</th>
                                <th rowSpan={2} className="px-2 py-2 text-center align-middle w-12">Del</th>
                            </tr>
                            <tr>
                                <th className="px-1 py-1 text-center border-r border-white/5 w-8">Qua</th>
                                <th className="px-1 py-1 text-center border-r border-white/5 w-8">Elim</th>
                                <th className="px-1 py-1 text-center border-r border-white/5 w-8">Qua</th>
                                <th className="px-1 py-1 text-center border-r border-white/5 w-8">Elim</th>
                                <th className="px-1 py-1 text-center border-r border-white/5 w-8">Qua</th>
                                <th className="px-1 py-1 text-center border-white/5 w-8">Elim</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Existing Rows */}
                            {form.competitionCategories.map((cat) => (
                                <tr
                                    key={cat.id}
                                    onDoubleClick={() => !editingId && editCategory(cat)}
                                    className={`hover:bg-white/5 transition-all duration-300 cursor-pointer group ${editingId === cat.id ? 'shining-gold bg-emerald-500/10 relative z-10' : ''}`}
                                    title={editingId === cat.id ? "" : "Double click to edit"}
                                >
                                    {editingId === cat.id ? (
                                        <>
                                            <td className="p-1 border-r border-white/5">
                                                <select
                                                    className="input !text-[10px] w-full !py-1 !px-2 !h-8 !min-w-[80px]"
                                                    value={newCategory.division}
                                                    onChange={e => setNewCategory({ ...newCategory, division: e.target.value })}
                                                >
                                                    {CATEGORY_DIVISIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-1 border-r border-white/5">
                                                <select
                                                    className="input !text-[10px] w-full !py-1 !px-2 !h-8 !min-w-[70px]"
                                                    value={newCategory.ageClass}
                                                    onChange={e => setNewCategory({ ...newCategory, ageClass: e.target.value })}
                                                >
                                                    {AGE_CLASSES.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-1 border-r border-white/5">
                                                <select
                                                    className="input !text-[10px] w-full !py-1 !px-2 !h-8 !min-w-[60px]"
                                                    value={newCategory.gender}
                                                    onChange={e => setNewCategory({ ...newCategory, gender: e.target.value })}
                                                >
                                                    {GENDERS.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-1 border-r border-white/5">
                                                <select
                                                    className="input !text-[10px] w-full !py-1 !px-2 !h-8 !min-w-[50px]"
                                                    value={newCategory.distance}
                                                    onChange={e => setNewCategory({ ...newCategory, distance: e.target.value })}
                                                >
                                                    {DISTANCES.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-0.5 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qInd} onChange={e => setNewCategory({ ...newCategory, qInd: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                            <td className="p-0.5 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eInd} onChange={e => setNewCategory({ ...newCategory, eInd: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                            <td className="p-0.5 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qTeam} onChange={e => setNewCategory({ ...newCategory, qTeam: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                            <td className="p-0.5 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eTeam} onChange={e => setNewCategory({ ...newCategory, eTeam: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                            <td className="p-0.5 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qMix} onChange={e => setNewCategory({ ...newCategory, qMix: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                            <td className="p-0.5 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eMix} onChange={e => setNewCategory({ ...newCategory, eMix: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                            <td className="p-0.5 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.isSpecial} onChange={e => setNewCategory({ ...newCategory, isSpecial: e.target.checked })} className="w-4 h-4 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                            <td className="p-1 border-r border-white/5">
                                                <input
                                                    type="text"
                                                    className={`input !text-[10px] w-full !py-1 !px-2 !h-8 min-w-[100px] ${!newCategory.isSpecial ? 'opacity-50 cursor-not-allowed bg-dark-900/50' : ''}`}
                                                    placeholder={newCategory.isSpecial ? "Name..." : "-"}
                                                    value={newCategory.isSpecial ? newCategory.categoryLabel : ''}
                                                    onChange={e => setNewCategory({ ...newCategory, categoryLabel: e.target.value })}
                                                    disabled={!newCategory.isSpecial}
                                                />
                                            </td>
                                            <td className="p-1 text-center bg-emerald-500/20">
                                                <button
                                                    onClick={handleSaveCategory}
                                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-1.5 rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center"
                                                    title="Save Changes"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-2 py-2 border-r border-white/5 font-medium">{cat.division}</td>
                                            <td className="px-2 py-2 border-r border-white/5">{cat.ageClass}</td>
                                            <td className="px-2 py-2 border-r border-white/5">{cat.gender}</td>
                                            <td className="px-2 py-2 border-r border-white/5">{cat.distance}</td>
                                            <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.qInd && <Check size={14} className="text-emerald-400" />}</div></td>
                                            <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.eInd && <Check size={14} className="text-emerald-400" />}</div></td>
                                            <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.qTeam && <Check size={14} className="text-blue-400" />}</div></td>
                                            <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.eTeam && <Check size={14} className="text-blue-400" />}</div></td>
                                            <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.qMix && <Check size={14} className="text-purple-400" />}</div></td>
                                            <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.eMix && <Check size={14} className="text-purple-400" />}</div></td>
                                            <td className="px-1 py-2 text-center border-r border-white/5"><div className="flex justify-center">{cat.isSpecial && <Check size={14} className="text-amber-400" />}</div></td>
                                            <td className="px-3 py-2 border-r border-white/5">{cat.categoryLabel}</td>
                                            <td className="px-2 py-2 text-center">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => removeCategory(cat.id)}
                                                        disabled={!!editingId}
                                                        className={`p-1.5 rounded transition-all ${editingId ? 'text-dark-600 cursor-not-allowed' : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'}`}
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}

                            {!editingId && (
                                <tr className="transition-all duration-300 bg-primary-500/5">
                                    <td className="p-1 border-r border-white/5">
                                        <select
                                            className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[100px]"
                                            value={newCategory.division}
                                            onChange={e => setNewCategory({ ...newCategory, division: e.target.value })}
                                        >
                                            {CATEGORY_DIVISIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1 border-r border-white/5">
                                        <select
                                            className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[90px]"
                                            value={newCategory.ageClass}
                                            onChange={e => setNewCategory({ ...newCategory, ageClass: e.target.value })}
                                        >
                                            {AGE_CLASSES.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1 border-r border-white/5">
                                        <select
                                            className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[80px]"
                                            value={newCategory.gender}
                                            onChange={e => setNewCategory({ ...newCategory, gender: e.target.value })}
                                        >
                                            {GENDERS.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1 border-r border-white/5">
                                        <select
                                            className="input !text-xs w-full !py-1 !px-2 !h-9 !min-w-[70px]"
                                            value={newCategory.distance}
                                            onChange={e => setNewCategory({ ...newCategory, distance: e.target.value })}
                                        >
                                            {DISTANCES.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qInd} onChange={e => setNewCategory({ ...newCategory, qInd: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                    <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eInd} onChange={e => setNewCategory({ ...newCategory, eInd: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                    <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qTeam} onChange={e => setNewCategory({ ...newCategory, qTeam: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                    <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eTeam} onChange={e => setNewCategory({ ...newCategory, eTeam: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                    <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.qMix} onChange={e => setNewCategory({ ...newCategory, qMix: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                    <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.eMix} onChange={e => setNewCategory({ ...newCategory, eMix: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                    <td className="p-1 text-center border-r border-white/5"><input type="checkbox" checked={newCategory.isSpecial} onChange={e => setNewCategory({ ...newCategory, isSpecial: e.target.checked })} className="w-5 h-5 rounded border-white/10 bg-dark-900 cursor-pointer accent-primary-500" /></td>
                                    <td className="p-1 border-r border-white/5">
                                        <input
                                            type="text"
                                            className={`input !text-xs w-full !py-1 !px-2 !h-9 min-w-[100px] ${!newCategory.isSpecial ? 'opacity-50 cursor-not-allowed bg-dark-900/50' : ''}`}
                                            placeholder={newCategory.isSpecial ? "Name..." : "-"}
                                            value={newCategory.isSpecial ? newCategory.categoryLabel : ''}
                                            onChange={e => setNewCategory({ ...newCategory, categoryLabel: e.target.value })}
                                            disabled={!newCategory.isSpecial}
                                        />
                                    </td>
                                    <td className="p-1 text-center">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={handleSaveCategory}
                                                className="btn btn-primary py-1 px-2 text-xs h-9 w-full flex items-center justify-center"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {form.competitionCategories.length === 0 && (
                <div className="text-center text-dark-500 text-sm py-4 italic">
                    No categories added yet. Add at least one category to proceed.
                </div>
            )}

            {/* Roles & Regulations */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <FileText className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-bold text-white">Roles & Regulations</h2>
                </div>
                <textarea
                    value={form.rules}
                    onChange={(e) => updateForm('rules', e.target.value)}
                    placeholder="Enter the rules, eligibility, terms and conditions for this event..."
                    className="input w-full h-40 resize-none"
                />
            </div>
        </div>
    );
};

export default Step2Categories;
