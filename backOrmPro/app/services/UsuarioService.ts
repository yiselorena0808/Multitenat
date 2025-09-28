import bcrypt from 'bcryptjs'
import Usuario from '#models/usuario'
import jwt from 'jsonwebtoken'



class UsuarioService {
  async register(
    id_empresa: number,
    id_area: number,
    nombre: string,
    apellido: string,
    nombre_usuario: string,
    correo_electronico: string,
    cargo: string,
    contrasena: string,
    confirmacion: string,
  ) {
    if (contrasena !== confirmacion) {
      return { mensaje: 'Las contraseñas no coinciden' }
    }

    const hash = await bcrypt.hash(contrasena, 10)

    const user = await Usuario.create({
      id_empresa,
      id_area,
      nombre,
      apellido,
      nombre_usuario,
      correo_electronico,
      cargo,
      contrasena: hash
    })

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        id_empresa: user.id_empresa,
        correoElectronico: user.correo_electronico,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET as string ,
      { expiresIn: '24h' }
    )

    return {
      mensaje: 'Registro correcto',
      user: await Usuario.query().where('id', user.id).preload('empresa').preload('area').first(),
      token
    }
  }

  async login(correoElectronico: string, contrasena: string) {
    if (!correoElectronico || !contrasena) {
      return { mensaje: 'Campos obligatorios' }
    }

    const user = await Usuario.query()
      .where('correo_electronico', correoElectronico)
      .preload('empresa')
      .preload('area')
      .first()

    if (!user) return { mensaje: 'El usuario no existe' }

    const isValid = await bcrypt.compare(contrasena, user.contrasena)
    if (!isValid) return { mensaje: 'Contraseña incorrecta' }

    const token = jwt.sign(
      {
        id: user.id,
        correoElectronico: user.correo_electronico,
        timestamp: Date.now(),
        id_empresa: user.id_empresa,
        nombre: user.nombre,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    )

    return { mensaje: 'Login correcto', token, user }
  }

  async listar(empresaId: number) {
    return await Usuario.query()
    .where('id_empresa', empresaId)
    .preload('empresa')
    .preload('area')
  }

  async listarId(id: number, empresaId: number) {
    return await Usuario.query()
    .where('id', id)
    .andWhere('id_empresa', empresaId)
    .preload('empresa').preload('area')
    .first()
  }

  async actualizar(id: number, datos: Partial<Usuario>, empresaId: number) {
    const usuario = await Usuario.query()
      .where('id', id)
      .andWhere('id_empresa', empresaId)
      .first()
    if (!usuario) return { error: 'Usuario no encontrado o autorizado' }

    usuario.merge(datos)
    await usuario.save()
    return await usuario
  }

  async eliminar(id: number, empresaId: number) {
    const usuario = await Usuario.query()
      .where('id', id)
      .andWhere('id_empresa', empresaId)
      .first()
    if (!usuario) return { mensaje: 'Usuario no encontrado o autorizado' }

    await usuario.delete()
    return { mensaje: 'Usuario eliminado' }
  }

  async conteo() {
    const usuarios = await Usuario.query()
    return { total: usuarios.length, usuarios }
  }
}

export default UsuarioService
