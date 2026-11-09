interface Persona { id: number; nombre: string; apellido: string };

export const datosDePersona = (p: Persona | null | undefined) => (p ? { id: p.id, nombre: p.nombre, apellido: p.apellido } : null);