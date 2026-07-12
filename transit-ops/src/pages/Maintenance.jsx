import React, { useState, useEffect } from 'react';
import { Wrench, Plus, AlertCircle, Play, CheckCircle, Clock } from 'lucide-react';
import { maintenanceService, vehicleService } from '../services/mockApi';
import { useNotifications } from '../context/NotificationContext';
import { Button, Input, Select, Badge, Card } from '../components/CommonUI';
import { Modal } from '../components/Modal';

export default function Maintenance() {
  const { addNotification } = useNotifications();
  
  const [tickets, setTickets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Forms
  const [form, setForm] = useState({
    vehicleId: '',
    issue: '',
    priority: 'Medium',
    status: 'Open',
  });
  
  const [costForm, setCostForm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const ticketsRes = await maintenanceService.getAll();
      setTickets(ticketsRes);

      const vehiclesRes = await vehicleService.getAll();
      setVehicles(vehiclesRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setForm({
      vehicleId: '',
      issue: '',
      priority: 'Medium',
      status: 'Open',
    });
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const newM = await maintenanceService.create(form);
      
      // Update vehicle status to In Shop
      const v = vehicles.find((item) => item.id === form.vehicleId);
      if (v) await vehicleService.update({ ...v, status: 'In Shop' });

      addNotification('Repair Registered', `Maintenance ticket registered for vehicle.`, 'warning');
      setIsAddOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusTransition = async (ticketId, nextStatus, cost = undefined) => {
    try {
      await maintenanceService.updateStatus(ticketId, nextStatus, cost);
      
      // If closing, set vehicle back to Available
      if (nextStatus === 'Closed') {
        const ticket = tickets.find((t) => t.id === ticketId);
        const v = vehicles.find((item) => item.id === ticket.vehicleId);
        if (v) await vehicleService.update({ ...v, status: 'Available' });
      }

      addNotification('Status Updated', `Ticket status updated to ${nextStatus}.`, 'success');
      setSelectedTicket(null);
      setCostForm('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const priorityColors = {
    Low: 'secondary',
    Medium: 'info',
    High: 'warning',
    Critical: 'danger',
  };

  const statusIcons = {
    Open: <AlertCircle className="w-4 h-4 text-amber-500" />,
    'In Progress': <Play className="w-4 h-4 text-blue-500" />,
    Closed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
  };

  // Group tickets by status for Kanban Board
  const openTickets = tickets.filter(t => t.status === 'Open');
  const inProgressTickets = tickets.filter(t => t.status === 'In Progress');
  const closedTickets = tickets.filter(t => t.status === 'Closed');

  const renderTicketCard = (ticket) => {
    const v = vehicles.find(item => item.id === ticket.vehicleId);
    return (
      <div
        key={ticket.id}
        onClick={() => setSelectedTicket(ticket)}
        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 text-left space-y-3"
      >
        <div className="flex justify-between items-start">
          <Badge variant={priorityColors[ticket.priority]}>{ticket.priority}</Badge>
          <span className="text-[10px] font-mono text-slate-400">{ticket.id}</span>
        </div>
        <p className="text-xs font-bold text-slate-850 dark:text-slate-100 line-clamp-2 leading-relaxed" title={ticket.issue}>
          {ticket.issue}
        </p>
        <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5 flex justify-between items-center text-[10px] text-slate-455">
          <div className="flex items-center space-x-1">
            <Wrench className="w-3 h-3 text-slate-400" />
            <span className="font-semibold">{v ? v.registrationNumber : ticket.vehicleId}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{ticket.assignedDate}</span>
          </div>
        </div>
        {ticket.status === 'Closed' && ticket.cost && (
          <div className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 rounded-lg px-2 py-0.5 inline-block">
            Cost: ${ticket.cost.toFixed(2)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Maintenance & Shop Tickets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track repairs, radiator leaks, brake pad resolutions, and assign trucks back into routing.
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          New Ticket
        </Button>
      </div>

      {/* KANBAN SWIMLANES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Open */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850">
            <div className="flex items-center space-x-2">
              {statusIcons.Open}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Open Diagnostics</h3>
            </div>
            <span className="text-xs font-bold text-slate-550 bg-white dark:bg-slate-850 px-2 py-0.5 rounded-md border">{openTickets.length}</span>
          </div>
          <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            {loading ? <Skeleton variant="card" /> : openTickets.map(renderTicketCard)}
            {!loading && openTickets.length === 0 && (
              <div className="text-center py-10 border border-dashed rounded-2xl text-slate-400 text-xs bg-white/50 dark:bg-slate-900/50">
                No tickets needing diagnostics.
              </div>
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850">
            <div className="flex items-center space-x-2">
              {statusIcons['In Progress']}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">In Shop Repairs</h3>
            </div>
            <span className="text-xs font-bold text-slate-550 bg-white dark:bg-slate-850 px-2 py-0.5 rounded-md border">{inProgressTickets.length}</span>
          </div>
          <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            {loading ? <Skeleton variant="card" /> : inProgressTickets.map(renderTicketCard)}
            {!loading && inProgressTickets.length === 0 && (
              <div className="text-center py-10 border border-dashed rounded-2xl text-slate-400 text-xs bg-white/50 dark:bg-slate-900/50">
                No active repairs in progress.
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Closed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200/50 dark:border-slate-850">
            <div className="flex items-center space-x-2">
              {statusIcons.Closed}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Resolved</h3>
            </div>
            <span className="text-xs font-bold text-slate-550 bg-white dark:bg-slate-850 px-2 py-0.5 rounded-md border">{closedTickets.length}</span>
          </div>
          <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
            {loading ? <Skeleton variant="card" /> : closedTickets.map(renderTicketCard)}
            {!loading && closedTickets.length === 0 && (
              <div className="text-center py-10 border border-dashed rounded-2xl text-slate-400 text-xs bg-white/50 dark:bg-slate-900/50">
                No resolved ticket records.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ADD TICKET MODAL --- */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Maintenance Request">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Select
            label="Select Vehicle Asset"
            required
            options={[
              { label: 'Select vehicle...', value: '' },
              ...vehicles.map((v) => ({
                label: `${v.registrationNumber} - ${v.name} (${v.status})`,
                value: v.id,
              })),
            ]}
            value={form.vehicleId}
            onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
          />
          <Input
            label="Reported Fault / Diagnostic Issue"
            required
            placeholder="Engine radiator leak detected, low pressure error"
            value={form.issue}
            onChange={(e) => setForm({ ...form, issue: e.target.value })}
          />
          <Select
            label="Criticality Priority"
            options={[
              { label: 'Low', value: 'Low' },
              { label: 'Medium', value: 'Medium' },
              { label: 'High', value: 'High' },
              { label: 'Critical', value: 'Critical' },
            ]}
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-855">
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- TICKET DETAILS / MODIFIER DIALOG --- */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Manage Repair Ticket">
        {selectedTicket && (
          <div className="space-y-5 text-xs font-semibold">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-left text-slate-700 dark:text-slate-350">
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket ID:</span>
                <span className="font-mono">{selectedTicket.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle registration:</span>
                <span>
                  {vehicles.find((v) => v.id === selectedTicket.vehicleId)?.registrationNumber ||
                    selectedTicket.vehicleId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Logged:</span>
                <span>{selectedTicket.assignedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Diagnostic Priority:</span>
                <Badge variant={priorityColors[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
              </div>
              <div className="flex flex-col pt-1">
                <span className="text-slate-400 mb-1">Issue Description:</span>
                <span className="text-slate-850 dark:text-slate-100 font-bold leading-relaxed">{selectedTicket.issue}</span>
              </div>
            </div>

            {/* Actions workflow */}
            <div className="space-y-4 pt-2 text-left">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-250">Update Ticket Workflow Status</h4>
              
              {selectedTicket.status === 'Open' && (
                <Button
                  variant="primary"
                  className="w-full py-3"
                  icon={Play}
                  onClick={() => handleStatusTransition(selectedTicket.id, 'In Progress')}
                >
                  Move into "In Shop Repairs"
                </Button>
              )}

              {selectedTicket.status === 'In Progress' && (
                <div className="space-y-3 border border-slate-250 dark:border-slate-800 p-4 rounded-2xl">
                  <h5 className="font-bold text-slate-750 dark:text-slate-300">Complete Repair Resolution</h5>
                  <p className="text-[10px] text-slate-455 leading-relaxed">
                    Input total cost of parts and shop labor to close out this ticket.
                  </p>
                  <Input
                    label="Final Invoice Cost ($)"
                    type="number"
                    required
                    placeholder="450.00"
                    value={costForm}
                    onChange={(e) => setCostForm(e.target.value)}
                  />
                  <Button
                    variant="success"
                    className="w-full py-3"
                    icon={CheckCircle}
                    disabled={!costForm}
                    onClick={() => handleStatusTransition(selectedTicket.id, 'Closed', costForm)}
                  >
                    Resolve & Close Ticket
                  </Button>
                </div>
              )}

              {selectedTicket.status === 'Closed' && (
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 p-4 rounded-xl border border-emerald-500/25 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs font-bold leading-normal">
                    This ticket has been completed and archived with invoice total: ${selectedTicket.cost?.toFixed(2)}.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-850">
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Close Panel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
