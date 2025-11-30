import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserRole } from '@/types/database';

interface InviteFormLabels {
  nameLabel: string;
  emailLabel: string;
  emailHelper: string;
  roleLabel: string;
  companyOption: string;
  psychologistOption: string;
  submitLabel: string;
  submittingLabel: string;
  placeholder: string;
}

interface InviteFormProps {
  pending?: boolean;
  onSubmit: (payload: { name: string; email?: string; role: UserRole }) => Promise<void>;
  labels?: Partial<InviteFormLabels>;
}

const defaultLabels: InviteFormLabels = {
  nameLabel: 'Nome do convidado',
  emailLabel: 'E-mail (opcional)',
  emailHelper: 'Preencha apenas se desejar enviar o convite por e-mail agora.',
  roleLabel: 'Tipo de convite',
  companyOption: 'Empresa',
  psychologistOption: 'Psicólogo',
  submitLabel: 'Gerar convite',
  submittingLabel: 'Enviando...',
  placeholder: 'nome@empresa.com',
};

export function InviteForm({ onSubmit, pending, labels }: InviteFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('company');
  const currentLabels = { ...defaultLabels, ...labels };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), email: email.trim() || undefined, role });
    setName('');
    setEmail('');
    setRole('company');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{currentLabels.nameLabel}</label>
        <Input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome completo"
          required
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">{currentLabels.emailLabel}</label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={currentLabels.placeholder}
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">{currentLabels.emailHelper}</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">{currentLabels.roleLabel}</label>
        <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
          <SelectTrigger>
            <SelectValue defaultValue="company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="company">{currentLabels.companyOption}</SelectItem>
            <SelectItem value="psychologist">
              {currentLabels.psychologistOption}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? currentLabels.submittingLabel : currentLabels.submitLabel}
      </Button>
    </form>
  );
}
