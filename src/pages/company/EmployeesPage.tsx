import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useI18n } from '@/i18n/I18nContext';
import { companiesApi, employeesApi } from '@/db/api';
import type { Employee } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    position: '',
    department: '',
  });

  useEffect(() => {
    loadCompanyAndEmployees();
  }, [profile]);

  const loadCompanyAndEmployees = async () => {
    if (!profile) return;
    try {
      const company = await companiesApi.getByProfileId(profile.id);
      if (company) {
        setCompanyId(company.id);
        const data = await employeesApi.getByCompany(company.id);
        setEmployees(data);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar funcionários: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingId(employee.id);
      setFormData({
        full_name: employee.full_name,
        email: employee.email || '',
        position: employee.position || '',
        department: employee.department || '',
      });
    } else {
      setEditingId(null);
      setFormData({ full_name: '', email: '', position: '', department: '' });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!companyId) return;
    if (!formData.full_name.trim()) {
      toast.error('Nome completo é obrigatório');
      return;
    }

    try {
      if (editingId) {
        await employeesApi.update(editingId, formData);
        toast.success('Funcionário atualizado com sucesso');
      } else {
        await employeesApi.create({
          ...formData,
          company_id: companyId,
        });
        toast.success('Funcionário cadastrado com sucesso');
      }
      setDialogOpen(false);
      loadCompanyAndEmployees();
    } catch (error: any) {
      toast.error('Erro ao salvar funcionário: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return;

    try {
      await employeesApi.delete(id);
      toast.success('Funcionário excluído com sucesso');
      loadCompanyAndEmployees();
    } catch (error: any) {
      toast.error('Erro ao excluir funcionário: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('employees.title')}</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os funcionários da sua empresa
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t('employees.create')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? t('employees.edit') : t('employees.create')}
              </DialogTitle>
              <DialogDescription>
                {editingId ? 'Edite as informações do funcionário' : 'Cadastre um novo funcionário'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">{t('employees.fullName')}</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="funcionario@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">{t('employees.position')}</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Cargo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{t('employees.department')}</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Departamento"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum funcionário cadastrado ainda
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeiro Funcionário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('employees.fullName')}</TableHead>
                <TableHead>{t('common.email')}</TableHead>
                <TableHead>{t('employees.position')}</TableHead>
                <TableHead>{t('employees.department')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.full_name}</TableCell>
                  <TableCell>{employee.email || '-'}</TableCell>
                  <TableCell>{employee.position || '-'}</TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
