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
  emailLabel: string;
  roleLabel: string;
  companyOption: string;
  psychologistOption: string;
  submitLabel: string;
  submittingLabel: string;
  placeholder: string;
}

interface InviteFormProps {
  pending?: boolean;
  onSubmit: (payload: { email: string; role: UserRole }) => Promise<void>;
  labels?: Partial<InviteFormLabels>;
}

const defaultLabels: InviteFormLabels = {
  emailLabel: 'E-mail',
  roleLabel: 'Tipo de convite',
  companyOption: 'Empresa',
  psychologistOption: 'Psicólogo',
  submitLabel: 'Gerar convite',
  submittingLabel: 'Enviando...',
  placeholder: 'nome@empresa.com',
};

export function InviteForm({ onSubmit, pending, labels }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('company');
  const currentLabels = { ...defaultLabels, ...labels };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({ email, role });
    setEmail('');
    setRole('company');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{currentLabels.emailLabel}</label>
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={currentLabels.placeholder}
          required
          disabled={pending}
        />
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
