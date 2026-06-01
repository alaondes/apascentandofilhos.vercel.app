export const cpfMask = (value: string) => {
  let v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 3) {
    v = v.replace(/^(\d{3})(\d)/, "$1.$2");
  }
  if (v.length > 7) {
    v = v.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  }
  if (v.length > 11) {
    v = v.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }
  return v;
};

export const phoneMask = (value: string) => {
  let v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  }
  if (v.length > 9) {
    // (XX) XXXXX-XXXX -> 15 chars
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  } else if (v.length > 8) {
    // (XX) XXXX-XXXX
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return v;
};

export const cepMask = (value: string) => {
  let v = value.replace(/\D/g, "").slice(0, 8);
  if (v.length > 5) {
    v = v.replace(/^(\d{5})(\d)/, "$1-$2");
  }
  return v;
};

export const numberMask = (value: string) => {
  return value.replace(/\D/g, "");
};

export const currencyMask = (value: string) => {
  let v = value.replace(/\D/g, "");
  if (v === "") return "";
  const numberValue = parseInt(v, 10);
  if (isNaN(numberValue)) return "";
  return (numberValue / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
