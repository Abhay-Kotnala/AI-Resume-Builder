import React, { useEffect, useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ApplicationCard } from '../components/ApplicationCard';
import { fetchApplications, createApplication, updateApplication, deleteApplication, JobApplicationDTO } from '../services/api';
import { MegaMenu } from '../components/MegaMenu'; // Assuming MegaMenu provides main navigation

const COLUMNS = [
    { id: 'WISHLIST', title: 'Wishlist', color: 'bg-slate-100', dot: 'bg-slate-400' },
    { id: 'APPLIED', title: 'Applied', color: 'bg-blue-50', dot: 'bg-blue-500' },
    { id: 'INTERVIEWING', title: 'Interviewing', color: 'bg-amber-50', dot: 'bg-amber-500' },
    { id: 'OFFER', title: 'Offer', color: 'bg-emerald-50', dot: 'bg-emerald-500' },
    { id: 'REJECTED', title: 'Rejected', color: 'bg-rose-50', dot: 'bg-rose-500' }
];

export const JobTracker: React.FC = () => {
    const [applications, setApplications] = useState<JobApplicationDTO[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<JobApplicationDTO | null>(null);
    const [formData, setFormData] = useState<Partial<JobApplicationDTO>>({});

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            const data = await fetchApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to load applications', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(parseInt(active.id as string, 10));
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeIdNum = parseInt(active.id as string, 10);
        const overIdStr = over.id as string;

        // If hovered over another item
        const isActiveTask = active.data.current?.type === 'Task';
        const isOverTask = over.data.current?.type === 'Task';

        if (!isActiveTask) return;

        // Dropping over another task
        if (isActiveTask && isOverTask) {
            setApplications((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeIdNum);
                const overIndex = tasks.findIndex((t) => t.id === parseInt(overIdStr, 10));

                if (tasks[activeIndex].status !== tasks[overIndex].status) {
                    tasks[activeIndex].status = tasks[overIndex].status;
                    return arrayMove(tasks, activeIndex, overIndex - 1);
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        // Dropping over an empty column
        const isOverColumn = over.data.current?.type === 'Column';
        if (isActiveTask && isOverColumn) {
            setApplications((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeIdNum);
                tasks[activeIndex].status = overIdStr;
                return arrayMove(tasks, activeIndex, activeIndex); // trigger re-render
            });
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeIdNum = parseInt(active.id as string, 10);
        const app = applications.find(a => a.id === activeIdNum);

        if (app) {
            try {
                // Sync with backend on drop
                await updateApplication(app.id!, app);
            } catch (error) {
                console.error('Failed to save updated status', error);
                loadApplications(); // Revert on failure
            }
        }
    };

    const handleSaveApp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingApp && editingApp.id) {
                await updateApplication(editingApp.id, formData as JobApplicationDTO);
            } else {
                await createApplication({ ...formData, status: formData.status || 'WISHLIST' } as JobApplicationDTO);
            }
            setIsModalOpen(false);
            loadApplications();
        } catch (error) {
            console.error('Failed to save application', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this application?')) return;
        try {
            await deleteApplication(id);
            loadApplications();
        } catch (error) {
            console.error('Failed to delete', error);
        }
    };

    const openModal = (app?: JobApplicationDTO) => {
        if (app) {
            setEditingApp(app);
            setFormData(app);
        } else {
            setEditingApp(null);
            setFormData({ status: 'WISHLIST' });
        }
        setIsModalOpen(true);
    };

    const activeApp = activeId ? applications.find(a => a.id === activeId) : null;

    return (
        <div className="min-h-screen bg-white">
            <MegaMenu />

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Job Tracker</h1>
                        <p className="text-slate-500 font-medium mt-1">Manage your applications and move them through the pipeline.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Application
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start snap-x">
                            {COLUMNS.map(col => {
                                const colApps = applications.filter(a => a.status === col.id);
                                return (
                                    <DroppableColumn
                                        key={col.id}
                                        column={col}
                                        applications={colApps}
                                        onEdit={openModal}
                                        onDelete={handleDelete}
                                    />
                                );
                            })}
                        </div>
                        <DragOverlay>
                            {activeApp ? <ApplicationCard application={activeApp} onEdit={() => { }} onDelete={() => { }} /> : null}
                        </DragOverlay>
                    </DndContext>
                )}
            </div>

            {/* Simple Modal for Add/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-extrabold text-lg">{editingApp ? 'Edit Application' : 'Add Application'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSaveApp} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Company</label>
                                <input required type="text" value={formData.companyName || ''} onChange={e => setFormData({ ...formData, companyName: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-semibold focus:border-indigo-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Job Title</label>
                                <input required type="text" value={formData.jobTitle || ''} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-semibold focus:border-indigo-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select value={formData.status || 'WISHLIST'} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-semibold focus:border-indigo-500 outline-none appearance-none">
                                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salary Range</label>
                                    <input type="text" placeholder="$100k - $120k" value={formData.salaryRange || ''} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 font-semibold focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 mt-4">
                                Save Application
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for Droppable Columns
import { useDroppable } from '@dnd-kit/core';

interface DroppableColumnProps {
    column: { id: string, title: string, color: string, dot: string };
    applications: JobApplicationDTO[];
    onEdit: (app: JobApplicationDTO) => void;
    onDelete: (id: number) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, applications, onEdit, onDelete }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: { type: 'Column', column }
    });

    return (
        <div className={`w-[320px] shrink-0 rounded-2xl flex flex-col h-full snap-center bg-slate-50/50 border border-slate-200/60`}>
            <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`}></span>
                    <h3 className="font-extrabold text-slate-700">{column.title}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded shadow-sm">{applications.length}</span>
            </div>

            <div ref={setNodeRef} className="flex-1 p-3 overflow-y-auto">
                <SortableContext items={applications.map(a => a.id!.toString())} strategy={verticalListSortingStrategy}>
                    {applications.map(app => (
                        <SortableApplicationCard key={app.id} application={app} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </SortableContext>
                {applications.length === 0 && (
                    <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center m-1 p-6 text-center">
                        <span className="text-sm font-semibold text-slate-400">Drop cards here</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Wrapper around ApplicationCard to provide Dnd data
const SortableApplicationCard: React.FC<any> = ({ application, onEdit, onDelete }) => {
    const { setNodeRef } = useDroppable({
        id: application.id.toString(),
        data: { type: 'Task', application }
    });

    return (
        <div ref={setNodeRef}>
            <ApplicationCard application={application} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
};
