import bcrypt from 'bcryptjs'
import Usuario from '#models/usuario'
import jwt from 'jsonwebtoken'
import hash from '@adonisjs/core/services/hash'




const SECRET = process.env.JWT_SECRET || 'sstrict'

class UsuarioService {

  private async verificarContrasena(hashAlmacenado: string, contrasenaPlano: string) {
    try {
      // Si es formato nuevo PHC ($bcrypt$...)
      if (hashAlmacenado.startsWith('$bcrypt$')) {
        return await hash.verify(hashAlmacenado, contrasenaPlano)
      }

      // Si es formato clásico ($2b$...)
      return await bcrypt.compare(contrasenaPlano, hashAlmacenado)
    } catch (error) {
      console.error('Error verificando contraseña:', error)
      return false
    }
  }

  // Registrar usuario
  async register(
    id_empresa: number,
    id_area: number,
    nombre: string,
    apellido: string,
    nombre_usuario: string,
    correo_electronico: string,
    cargo: string,
    contrasena: string,
    confirmacion: string
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
      contrasena: hash,
    })

    return {
      mensaje: 'Registro correcto',
      user: await Usuario.query()
        .where('id', user.id)
        .preload('empresa')
        .preload('area')
        .first(),
    }
  }

  // Login
  async login(correo_electronico: string, contrasena: string) {
    if (!correo_electronico || !contrasena) {
      throw new Error('Campos obligatorios')
    }

    const usuario = await Usuario.query()
      .where('correo_electronico', correo_electronico)
      .preload('empresa')
      .preload('area')
      .first()

    if (!usuario) throw new Error('El usuario no existe')

      const ok = await this.verificarContrasena(usuario.contrasena, contrasena)
    if (!ok) {
      throw new Error('Contraseña incorrecta')
    }


      if (hash.needsReHash(usuario.contrasena)) {
      usuario.contrasena = await hash.make(contrasena)
      await usuario.save()
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correoElectronico: usuario.correo_electronico,
        id_empresa: usuario.id_empresa,
        nombre: `${usuario.nombre} ${usuario.apellido}`,
      },
      SECRET,
      { expiresIn: '1h' }
    )

    return { mensaje: 'Login correcto', token, user: usuario }
  }

  // Listar usuario por ID y empresa
  async listarId(id: number, empresaId: number) {
    return await Usuario.query()
      .where('id', id)
      .andWhere('id_empresa', empresaId)
      .preload('empresa')
      .preload('area')
      .first()
  }

  // 🔹 NUEVA FUNCIÓN: listar todos los usuarios de una empresa
  async listarPorEmpresa(empresaId: number) {
    return await Usuario.query()
      .where('id_empresa', empresaId)
      .preload('empresa')
      .preload('area')
  }

  // Actualizar usuario
  async actualizar(id: number, datos: Partial<Usuario>, empresaId: number) {
  const usuario = await Usuario.query()
    .where('id', id)
    .andWhere('id_empresa', empresaId)
    .first()

    console.log('Service actualizar => id:', id, 'empresaId:', empresaId)
    console.log('Datos que se van a mergear:', datos)


  if (!usuario) return { error: 'Usuario no encontrado o autorizado' }


  usuario.merge(datos)

  await usuario.save()
  return usuario
}

  // Eliminar usuario
  async eliminar(id: number, empresaId: number) {
    const usuario = await Usuario.query()
      .where('id', id)
      .andWhere('id_empresa', empresaId)
      .first()
    if (!usuario) return { mensaje: 'Usuario no encontrado o autorizado' }

    await usuario.delete()
    return { mensaje: 'Usuario eliminado' }
  }

  // Conteo de usuarios
  async conteo() {
    const usuarios = await Usuario.query()
    return { total: usuarios.length, usuarios }
  }
}

export default UsuarioService
