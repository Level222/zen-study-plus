export type User = {
  zane_user_id: number;
  name: string;
  icon: string;
  sex: number;
  birthday: number;
  authority: string[];
  payment: boolean;
  payments: string[];
  is_chargeable: boolean;
  is_personal_information_needed: boolean;
  capabilities: string[];
};
