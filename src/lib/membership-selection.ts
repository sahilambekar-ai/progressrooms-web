type ClassOption = { id: string; package_id?: string; total_classes?: number };

/** Legacy shared-credit class access and per-class package allowances are distinct pass types. */
export function membershipSelection<T extends ClassOption>(options: T[], selectedIds: string[], mode: "CLASS" | "PACKAGE") {
  const selectableClasses = options.filter(option => mode === "PACKAGE" ? !!option.package_id : !option.package_id);
  const selectedOptions = selectableClasses.filter(option => selectedIds.includes(option.id));
  const selectedPackages = selectedOptions.filter(option => option.package_id);
  const includedSessions = selectedPackages.reduce((sum, option) => sum + (option.total_classes || 0), 0);
  return { selectableClasses, selectedOptions, selectedPackages, includedSessions };
}
