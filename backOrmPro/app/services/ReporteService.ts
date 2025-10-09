import Reporte from "#models/reporte"

export interface DatosReporte {
  id_usuario: number
  id_empresa: number
  nombre_usuario: string
  cargo: string
  cedula: string
  fecha: string
  lugar: string
  descripcion: string
  imagen?: string
  archivos?: string
  estado?: string
}

export default class ReporteService {
  // Crear reporte
  async crear(idEmpresa: number, datos: DatosReporte) {
  const reporte = new Reporte()

  reporte.fill({
    ...datos,
    // Si datos.id_empresa ya viene del frontend, no lo reemplazamos
    id_empresa: datos.id_empresa || idEmpresa,
    estado: datos.estado || "Pendiente",
  })

  await reporte.save()
  return reporte
}

  // Listar reportes por empresa
  async listar(idEmpresa: number) {
    return Reporte.query()
      .where("id_empresa", idEmpresa)
      .orderBy("fecha", "desc")
  }

  // Listar reporte por ID y empresa
  async listarId(id: number, idEmpresa: number) {
    return Reporte.query()
      .where("id", id)
      .andWhere("id_empresa", idEmpresa)
      .firstOrFail()
  }

  // Actualizar reporte
  async actualizar(id: number, idEmpresa: number, datos: Partial<DatosReporte>) {
    const reporte = await Reporte.query()
      .where("id", id)
      .andWhere("id_empresa", idEmpresa)
      .firstOrFail()

    reporte.merge(datos)
    await reporte.save()
    return reporte
  }

  // Eliminar reporte
  async eliminar(id: number, idEmpresa: number) {
    const reporte = await Reporte.query()
      .where("id", id)
      .andWhere("id_empresa", idEmpresa)
      .firstOrFail()

    await reporte.delete()
    return { mensaje: "Reporte eliminado" }
  }

  // Conteo total de reportes
  async conteo() {
    const result = await Reporte.query().count("* as total")
    return result[0]
  }
}
