 /**
 * Entidade User - Representa um usuário do sistema
 */
export class User {
  constructor({ id, nome, email, senha, dataNascimento, createdAt, updatedAt }) {
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.senha = senha;
    this.dataNascimento = dataNascimento;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Retorna dados do usuário sem informações sensíveis
   */
  toPublic() {
    return {
      id: this.id,
      nome: this.nome,
      email: this.email,
      dataNascimento: this.dataNascimento,
      createdAt: this.createdAt
    };
  }

  /**
   * Valida se o usuário é maior de idade
   */
  isMaiorDeIdade() {
    const hoje = new Date();
    const nascimento = new Date(this.dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAniversario = hoje.getMonth() - nascimento.getMonth();
    
    if (mesAniversario < 0 || (mesAniversario === 0 && hoje.getDate() < nascimento.getDate())) {
      return idade - 1 >= 18;
    }
    
    return idade >= 18;
  }
}