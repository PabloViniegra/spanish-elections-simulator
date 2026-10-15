export const format = (value: number) => Math.round(value).toLocaleString("es-ES", { useGrouping: "always" });
export const percent = (share: number) => `${(share * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;
