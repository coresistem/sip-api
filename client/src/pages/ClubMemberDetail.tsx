import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { ArrowLeft, Mail, Phone, MapPin, Award, Activity } from 'lucide-react';

export default function ClubMemberDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [member, setMember] = useState<any>(null); // Replace with generic type for now
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const res = await api.get(`/athletes/${id}`); // Leveraging existing athlete endpoint for detailed data
                setMember(res.data.data);
            } catch (error) {
                console.error('Failed to fetch member:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-dark-400">Loading...</div>;
    if (!member) return <div className="p-12 text-center text-dark-400">Member not found</div>;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-dark-400 hover:text-white transition-colors">
                <ArrowLeft size={18} /> Back to Members
            </button>

            {/* Profile Header */}
            <div className="card p-6 flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center font-bold text-3xl text-white shrink-0">
                    {member.user.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-display font-bold mb-2">{member.user.name}</h1>
                    <div className="flex flex-wrap gap-4 text-dark-400">
                        <span className="flex items-center gap-1"><Mail size={16} /> {member.user.email}</span>
                        {member.user.phone && <span className="flex items-center gap-1"><Phone size={16} /> {member.user.phone}</span>}
                        <span className="badge badge-primary">{member.archeryCategory}</span>
                        <span className="badge badge-secondary">{member.skillLevel}</span>
                    </div>
                </div>
            </div>

            {/* Tabs / detailed sections placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity className="text-primary-500" /> Recent Activity</h2>
                    <p className="text-dark-400 italic">No recent sessions recorded.</p>
                </div>
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award className="text-accent-500" /> Performance Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark-800/50 p-3 rounded">
                            <label className="text-xs text-dark-500 uppercase">Total Score</label>
                            <div className="text-xl font-mono font-bold">0</div>
                        </div>
                        <div className="bg-dark-800/50 p-3 rounded">
                            <label className="text-xs text-dark-500 uppercase">Average</label>
                            <div className="text-xl font-mono font-bold">0.0</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
