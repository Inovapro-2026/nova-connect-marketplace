export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          cliente_id: string
          comentario: string | null
          created_at: string | null
          id: string
          nota: number
          pedido_id: string | null
          produto_id: string | null
          resposta_at: string | null
          resposta_vendedor: string | null
          servico_id: string | null
          vendedor_id: string | null
        }
        Insert: {
          cliente_id: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          nota: number
          pedido_id?: string | null
          produto_id?: string | null
          resposta_at?: string | null
          resposta_vendedor?: string | null
          servico_id?: string | null
          vendedor_id?: string | null
        }
        Update: {
          cliente_id?: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          nota?: number
          pedido_id?: string | null
          produto_id?: string | null
          resposta_at?: string | null
          resposta_vendedor?: string | null
          servico_id?: string | null
          vendedor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: true
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          ativo: boolean | null
          botao_link: string | null
          botao_texto: string | null
          created_at: string | null
          id: string
          imagem_url: string
          ordem: number | null
          subtitulo: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          botao_link?: string | null
          botao_texto?: string | null
          created_at?: string | null
          id?: string
          imagem_url: string
          ordem?: number | null
          subtitulo?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          botao_link?: string | null
          botao_texto?: string | null
          created_at?: string | null
          id?: string
          imagem_url?: string
          ordem?: number | null
          subtitulo?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      carteiras: {
        Row: {
          auth_user_id: string
          created_at: string | null
          id: string
          saldo_disponivel: number | null
          saldo_pendente: number | null
          total_sacado: number | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id: string
          created_at?: string | null
          id?: string
          saldo_disponivel?: number | null
          saldo_pendente?: number | null
          total_sacado?: number | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string
          created_at?: string | null
          id?: string
          saldo_disponivel?: number | null
          saldo_pendente?: number | null
          total_sacado?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      carts: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          scope: string | null
          slug: string
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          scope?: string | null
          slug: string
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          scope?: string | null
          slug?: string
          tipo?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          slug: string
          tipo: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          slug: string
          tipo?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          slug?: string
          tipo?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          order_id: string | null
          product_id: string | null
          seller_id: string
          status_atendimento: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          seller_id: string
          status_atendimento?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          order_id?: string | null
          product_id?: string | null
          seller_id?: string
          status_atendimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cidade: string | null
          cpf: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          estado: string | null
          id: string
          is_vip: boolean | null
          nome: string
          observacoes: string | null
          origem: string | null
          pais: string | null
          segmento: string | null
          seller_id: string
          sobrenome: string | null
          status: string | null
          tags: string[] | null
          telefone: string | null
          total_gasto: number | null
          total_pedidos: number | null
          ultima_compra_em: string | null
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          estado?: string | null
          id?: string
          is_vip?: boolean | null
          nome: string
          observacoes?: string | null
          origem?: string | null
          pais?: string | null
          segmento?: string | null
          seller_id: string
          sobrenome?: string | null
          status?: string | null
          tags?: string[] | null
          telefone?: string | null
          total_gasto?: number | null
          total_pedidos?: number | null
          ultima_compra_em?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          estado?: string | null
          id?: string
          is_vip?: boolean | null
          nome?: string
          observacoes?: string | null
          origem?: string | null
          pais?: string | null
          segmento?: string | null
          seller_id?: string
          sobrenome?: string | null
          status?: string | null
          tags?: string[] | null
          telefone?: string | null
          total_gasto?: number | null
          total_pedidos?: number | null
          ultima_compra_em?: string | null
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_usuario: {
        Row: {
          created_at: string | null
          id: string
          mostrar_email: boolean | null
          mostrar_telefone: boolean | null
          notif_email_avaliacao: boolean | null
          notif_email_mensagem: boolean | null
          notif_email_pedido: boolean | null
          notif_push_mensagem: boolean | null
          notif_push_pedido: boolean | null
          perfil_publico: boolean | null
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          notif_email_avaliacao?: boolean | null
          notif_email_mensagem?: boolean | null
          notif_email_pedido?: boolean | null
          notif_push_mensagem?: boolean | null
          notif_push_pedido?: boolean | null
          perfil_publico?: boolean | null
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          notif_email_avaliacao?: boolean | null
          notif_email_mensagem?: boolean | null
          notif_email_pedido?: boolean | null
          notif_push_mensagem?: boolean | null
          notif_push_pedido?: boolean | null
          perfil_publico?: boolean | null
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_usuario_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      conversas: {
        Row: {
          created_at: string | null
          id: string
          nao_lidas_p1: number | null
          nao_lidas_p2: number | null
          participante_1_id: string
          participante_2_id: string
          pedido_id: string | null
          ultima_mensagem: string | null
          ultima_mensagem_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nao_lidas_p1?: number | null
          nao_lidas_p2?: number | null
          participante_1_id: string
          participante_2_id: string
          pedido_id?: string | null
          ultima_mensagem?: string | null
          ultima_mensagem_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nao_lidas_p1?: number | null
          nao_lidas_p2?: number | null
          participante_1_id?: string
          participante_2_id?: string
          pedido_id?: string | null
          ultima_mensagem?: string | null
          ultima_mensagem_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversas_participante_1_id_fkey"
            columns: ["participante_1_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_participante_2_id_fkey"
            columns: ["participante_2_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_one: string
          participant_two: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_one: string
          participant_two: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_one?: string
          participant_two?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_one_fkey"
            columns: ["participant_one"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_two_fkey"
            columns: ["participant_two"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          desconto_percentual: number
          id: string
          limite_usos: number | null
          updated_at: string | null
          usos_totais: number | null
          validade: string | null
          vendedor_id: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          desconto_percentual: number
          id?: string
          limite_usos?: number | null
          updated_at?: string | null
          usos_totais?: number | null
          validade?: string | null
          vendedor_id: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          desconto_percentual?: number
          id?: string
          limite_usos?: number | null
          updated_at?: string | null
          usos_totais?: number | null
          validade?: string | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupons_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
        ]
      }
      extrato: {
        Row: {
          carteira_id: string
          criado_em: string | null
          descricao: string | null
          id: string
          metadata: Json | null
          referencia_id: string | null
          status: Database["public"]["Enums"]["transacao_status"]
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          valor: number
        }
        Insert: {
          carteira_id: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          referencia_id?: string | null
          status?: Database["public"]["Enums"]["transacao_status"]
          tipo: Database["public"]["Enums"]["transacao_tipo"]
          valor: number
        }
        Update: {
          carteira_id?: string
          criado_em?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          referencia_id?: string | null
          status?: Database["public"]["Enums"]["transacao_status"]
          tipo?: Database["public"]["Enums"]["transacao_tipo"]
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "extrato_carteira_id_fkey"
            columns: ["carteira_id"]
            isOneToOne: false
            referencedRelation: "carteiras"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          created_at: string | null
          id: string
          produto_id: string | null
          servico_id: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          produto_id?: string | null
          servico_id?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          produto_id?: string | null
          servico_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favoritos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancer_specialties: {
        Row: {
          freelancer_id: string | null
          id: string
          specialty_id: string | null
        }
        Insert: {
          freelancer_id?: string | null
          id?: string
          specialty_id?: string | null
        }
        Update: {
          freelancer_id?: string | null
          id?: string
          specialty_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_specialties_freelancer_id_fkey"
            columns: ["freelancer_id"]
            isOneToOne: false
            referencedRelation: "freelancers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freelancer_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      freelancers: {
        Row: {
          bio: string | null
          created_at: string | null
          destaque: boolean | null
          disponibilidade: boolean | null
          especialidade_principal: string | null
          id: string
          preco_base: number | null
          profile_id: string | null
          reputacao: number | null
          titulo_profissional: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          destaque?: boolean | null
          disponibilidade?: boolean | null
          especialidade_principal?: string | null
          id?: string
          preco_base?: number | null
          profile_id?: string | null
          reputacao?: number | null
          titulo_profissional?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          destaque?: boolean | null
          disponibilidade?: boolean | null
          especialidade_principal?: string | null
          id?: string
          preco_base?: number | null
          profile_id?: string | null
          reputacao?: number | null
          titulo_profissional?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      logs_administrativos: {
        Row: {
          acao: string
          admin_id: string
          alvo_usuario_id: string
          created_at: string | null
          detalhes: Json | null
          id: string
        }
        Insert: {
          acao: string
          admin_id: string
          alvo_usuario_id: string
          created_at?: string | null
          detalhes?: Json | null
          id?: string
        }
        Update: {
          acao?: string
          admin_id?: string
          alvo_usuario_id?: string
          created_at?: string | null
          detalhes?: Json | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_administrativos_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_administrativos_alvo_usuario_id_fkey"
            columns: ["alvo_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_envio: {
        Row: {
          canal: string
          criado_em: string | null
          destino: string
          erro: string | null
          id: string
          status: string
          user_id: string | null
        }
        Insert: {
          canal: string
          criado_em?: string | null
          destino: string
          erro?: string | null
          id?: string
          status: string
          user_id?: string | null
        }
        Update: {
          canal?: string
          criado_em?: string | null
          destino?: string
          erro?: string | null
          id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_envio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          conteudo: string
          conversa_id: string
          created_at: string | null
          id: string
          lida: boolean | null
          remetente_id: string
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          conteudo: string
          conversa_id: string
          created_at?: string | null
          id?: string
          lida?: boolean | null
          remetente_id: string
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          conteudo?: string
          conversa_id?: string
          created_at?: string | null
          id?: string
          lida?: boolean | null
          remetente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_carteira: {
        Row: {
          carteira_id: string
          created_at: string | null
          descricao: string | null
          id: string
          status: string | null
          tipo: string
          valor: number
        }
        Insert: {
          carteira_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          tipo: string
          valor: number
        }
        Update: {
          carteira_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_carteira_carteira_id_fkey"
            columns: ["carteira_id"]
            isOneToOne: false
            referencedRelation: "carteiras"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          admin_id: string | null
          arquivo_nome: string | null
          arquivo_url: string | null
          created_at: string | null
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string
          metadata: Json | null
          tipo: Database["public"]["Enums"]["tipo_notificacao_enum"]
          titulo: string
          usuario_id: string
        }
        Insert: {
          admin_id?: string | null
          arquivo_nome?: string | null
          arquivo_url?: string | null
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem: string
          metadata?: Json | null
          tipo?: Database["public"]["Enums"]["tipo_notificacao_enum"]
          titulo: string
          usuario_id: string
        }
        Update: {
          admin_id?: string | null
          arquivo_nome?: string | null
          arquivo_url?: string | null
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string
          metadata?: Json | null
          tipo?: Database["public"]["Enums"]["tipo_notificacao_enum"]
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string | null
          tipo: string | null
          titulo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          seller_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          seller_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          asaas_id: string | null
          atualizado_em: string | null
          checkout_url: string | null
          criado_em: string | null
          data_confirmacao: string | null
          id: string
          metodo_pagamento: string
          payload_webhook: Json | null
          pedido_id: string
          pix_copia_cola: string | null
          pix_qrcode: string | null
          status_asaas: string
          taxa_asaas: number | null
          valor_bruto: number
          valor_liquido: number | null
        }
        Insert: {
          asaas_id?: string | null
          atualizado_em?: string | null
          checkout_url?: string | null
          criado_em?: string | null
          data_confirmacao?: string | null
          id?: string
          metodo_pagamento: string
          payload_webhook?: Json | null
          pedido_id: string
          pix_copia_cola?: string | null
          pix_qrcode?: string | null
          status_asaas: string
          taxa_asaas?: number | null
          valor_bruto: number
          valor_liquido?: number | null
        }
        Update: {
          asaas_id?: string | null
          atualizado_em?: string | null
          checkout_url?: string | null
          criado_em?: string | null
          data_confirmacao?: string | null
          id?: string
          metodo_pagamento?: string
          payload_webhook?: Json | null
          pedido_id?: string
          pix_copia_cola?: string | null
          pix_qrcode?: string | null
          status_asaas?: string
          taxa_asaas?: number | null
          valor_bruto?: number
          valor_liquido?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_splits: {
        Row: {
          asaas_split_id: string | null
          criado_em: string | null
          id: string
          pagamento_id: string
          porcentagem_plataforma: number | null
          status_repasse: string | null
          taxa_split_fixa: number | null
          valor_plataforma: number
          valor_vendedor: number
          vendedor_id: string
        }
        Insert: {
          asaas_split_id?: string | null
          criado_em?: string | null
          id?: string
          pagamento_id: string
          porcentagem_plataforma?: number | null
          status_repasse?: string | null
          taxa_split_fixa?: number | null
          valor_plataforma: number
          valor_vendedor: number
          vendedor_id: string
        }
        Update: {
          asaas_split_id?: string | null
          criado_em?: string | null
          id?: string
          pagamento_id?: string
          porcentagem_plataforma?: number | null
          status_repasse?: string | null
          taxa_split_fixa?: number | null
          valor_plataforma?: number
          valor_vendedor?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_splits_pagamento_id_fkey"
            columns: ["pagamento_id"]
            isOneToOne: false
            referencedRelation: "pagamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_splits_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_id: string
          codigo_rastreio: string | null
          created_at: string | null
          data_entrega: string | null
          data_envio: string | null
          data_pagamento: string | null
          data_prazo: string | null
          deleted_at: string | null
          entrega_final_url: string | null
          entrega_mensagem: string | null
          gateway: string | null
          gateway_payment_id: string | null
          historico_status: Json | null
          id: string
          metodo_pagamento: string | null
          numero: string
          prazo_entrega_dias: number | null
          produto_id: string | null
          requisitos_cliente: string | null
          servico_id: string | null
          status: Database["public"]["Enums"]["status_pedido_enum"]
          status_servico: string | null
          taxa_asaas: number | null
          taxa_marketplace: number | null
          taxa_plataforma: number
          tipo_item: string | null
          transportadora: string | null
          updated_at: string | null
          valor_liquido: number | null
          valor_liquido_vendedor: number
          valor_total: number
          vendedor_id: string
        }
        Insert: {
          cliente_id: string
          codigo_rastreio?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_envio?: string | null
          data_pagamento?: string | null
          data_prazo?: string | null
          deleted_at?: string | null
          entrega_final_url?: string | null
          entrega_mensagem?: string | null
          gateway?: string | null
          gateway_payment_id?: string | null
          historico_status?: Json | null
          id?: string
          metodo_pagamento?: string | null
          numero?: string
          prazo_entrega_dias?: number | null
          produto_id?: string | null
          requisitos_cliente?: string | null
          servico_id?: string | null
          status?: Database["public"]["Enums"]["status_pedido_enum"]
          status_servico?: string | null
          taxa_asaas?: number | null
          taxa_marketplace?: number | null
          taxa_plataforma?: number
          tipo_item?: string | null
          transportadora?: string | null
          updated_at?: string | null
          valor_liquido?: number | null
          valor_liquido_vendedor?: number
          valor_total: number
          vendedor_id: string
        }
        Update: {
          cliente_id?: string
          codigo_rastreio?: string | null
          created_at?: string | null
          data_entrega?: string | null
          data_envio?: string | null
          data_pagamento?: string | null
          data_prazo?: string | null
          deleted_at?: string | null
          entrega_final_url?: string | null
          entrega_mensagem?: string | null
          gateway?: string | null
          gateway_payment_id?: string | null
          historico_status?: Json | null
          id?: string
          metodo_pagamento?: string | null
          numero?: string
          prazo_entrega_dias?: number | null
          produto_id?: string | null
          requisitos_cliente?: string | null
          servico_id?: string | null
          status?: Database["public"]["Enums"]["status_pedido_enum"]
          status_servico?: string | null
          taxa_asaas?: number | null
          taxa_marketplace?: number | null
          taxa_plataforma?: number
          tipo_item?: string | null
          transportadora?: string | null
          updated_at?: string | null
          valor_liquido?: number | null
          valor_liquido_vendedor?: number
          valor_total?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_vendedor: {
        Row: {
          aparencia: Json | null
          api_key: string | null
          automacao_whatsapp: Json | null
          avaliacao_media: number | null
          banco: string | null
          banner_url: string | null
          bio: string | null
          categorias_atendidas: string[] | null
          chave_pix: string | null
          cpf_cnpj: string | null
          created_at: string | null
          dados_bancarios: Json | null
          headline: string | null
          id: string
          links_externos: Json | null
          localizacao: string | null
          nome_profissional: string | null
          notificacoes: Json | null
          pix_chave: string | null
          pix_tipo: string | null
          portfolio: Json | null
          saldo_disponivel: number | null
          saldo_pendente: number | null
          saldo_sacado: number | null
          skills: string[] | null
          tempo_resposta_horas: number | null
          titular: string | null
          total_avaliacoes: number | null
          total_vendas: number | null
          updated_at: string | null
          username: string | null
          usuario_id: string
          verificado: boolean | null
        }
        Insert: {
          aparencia?: Json | null
          api_key?: string | null
          automacao_whatsapp?: Json | null
          avaliacao_media?: number | null
          banco?: string | null
          banner_url?: string | null
          bio?: string | null
          categorias_atendidas?: string[] | null
          chave_pix?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          dados_bancarios?: Json | null
          headline?: string | null
          id?: string
          links_externos?: Json | null
          localizacao?: string | null
          nome_profissional?: string | null
          notificacoes?: Json | null
          pix_chave?: string | null
          pix_tipo?: string | null
          portfolio?: Json | null
          saldo_disponivel?: number | null
          saldo_pendente?: number | null
          saldo_sacado?: number | null
          skills?: string[] | null
          tempo_resposta_horas?: number | null
          titular?: string | null
          total_avaliacoes?: number | null
          total_vendas?: number | null
          updated_at?: string | null
          username?: string | null
          usuario_id: string
          verificado?: boolean | null
        }
        Update: {
          aparencia?: Json | null
          api_key?: string | null
          automacao_whatsapp?: Json | null
          avaliacao_media?: number | null
          banco?: string | null
          banner_url?: string | null
          bio?: string | null
          categorias_atendidas?: string[] | null
          chave_pix?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          dados_bancarios?: Json | null
          headline?: string | null
          id?: string
          links_externos?: Json | null
          localizacao?: string | null
          nome_profissional?: string | null
          notificacoes?: Json | null
          pix_chave?: string | null
          pix_tipo?: string | null
          portfolio?: Json | null
          saldo_disponivel?: number | null
          saldo_pendente?: number | null
          saldo_sacado?: number | null
          skills?: string[] | null
          tempo_resposta_horas?: number | null
          titular?: string | null
          total_avaliacoes?: number | null
          total_vendas?: number | null
          updated_at?: string | null
          username?: string | null
          usuario_id?: string
          verificado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_vendedor_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: true
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          ordem: number | null
          produto_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          ordem?: number | null
          produto_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          ordem?: number | null
          produto_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          categoria_id: string | null
          created_at: string | null
          descricao_completa: string | null
          descricao_curta: string | null
          description: string | null
          external_link: string | null
          id: string
          image_url: string | null
          item_type: string | null
          name: string
          price: number
          seller_id: string
          status: Database["public"]["Enums"]["product_status"]
          tipo_entrega: string | null
          updated_at: string | null
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string | null
          descricao_completa?: string | null
          descricao_curta?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          item_type?: string | null
          name: string
          price?: number
          seller_id: string
          status?: Database["public"]["Enums"]["product_status"]
          tipo_entrega?: string | null
          updated_at?: string | null
        }
        Update: {
          categoria_id?: string | null
          created_at?: string | null
          descricao_completa?: string | null
          descricao_curta?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          item_type?: string | null
          name?: string
          price?: number
          seller_id?: string
          status?: Database["public"]["Enums"]["product_status"]
          tipo_entrega?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          document: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          document?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          document?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      promotional_ads: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          destaque: boolean | null
          id: string
          imagem_url: string
          link: string | null
          titulo: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_url: string
          link?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          destaque?: boolean | null
          id?: string
          imagem_url?: string
          link?: string | null
          titulo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saques: {
        Row: {
          chave_pix: string | null
          created_at: string | null
          dados_bancarios: Json | null
          id: string
          metodo: string
          observacao: string | null
          processado_at: string | null
          status: Database["public"]["Enums"]["status_saque_enum"]
          taxa_valor: number | null
          tipo_pix: string | null
          updated_at: string | null
          valor: number
          valor_bruto: number | null
          valor_liquido: number | null
          vendedor_id: string
        }
        Insert: {
          chave_pix?: string | null
          created_at?: string | null
          dados_bancarios?: Json | null
          id?: string
          metodo?: string
          observacao?: string | null
          processado_at?: string | null
          status?: Database["public"]["Enums"]["status_saque_enum"]
          taxa_valor?: number | null
          tipo_pix?: string | null
          updated_at?: string | null
          valor: number
          valor_bruto?: number | null
          valor_liquido?: number | null
          vendedor_id: string
        }
        Update: {
          chave_pix?: string | null
          created_at?: string | null
          dados_bancarios?: Json | null
          id?: string
          metodo?: string
          observacao?: string | null
          processado_at?: string | null
          status?: Database["public"]["Enums"]["status_saque_enum"]
          taxa_valor?: number | null
          tipo_pix?: string | null
          updated_at?: string | null
          valor?: number
          valor_bruto?: number | null
          valor_liquido?: number | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saques_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
        ]
      }
      servico_imagens: {
        Row: {
          created_at: string | null
          id: string
          ordem: number | null
          servico_id: string
          titulo: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ordem?: number | null
          servico_id: string
          titulo?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ordem?: number | null
          servico_id?: string
          titulo?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "servico_imagens_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          avaliacao_media: number | null
          categoria_id: string
          created_at: string | null
          deleted_at: string | null
          descricao_completa: string
          descricao_curta: string
          faq: Json | null
          fluxo_chat_obrigatorio: boolean | null
          id: string
          imagem_principal_url: string | null
          prazo_entrega_dias: number
          preco_base: number
          requisitos_cliente: string | null
          revisoes_inclusas: number
          slug: string
          status: Database["public"]["Enums"]["status_servico_enum"]
          tags: string[] | null
          titulo: string
          total_avaliacoes: number | null
          total_pedidos: number | null
          total_visualizacoes: number | null
          updated_at: string | null
          vendedor_id: string
        }
        Insert: {
          avaliacao_media?: number | null
          categoria_id: string
          created_at?: string | null
          deleted_at?: string | null
          descricao_completa: string
          descricao_curta: string
          faq?: Json | null
          fluxo_chat_obrigatorio?: boolean | null
          id?: string
          imagem_principal_url?: string | null
          prazo_entrega_dias?: number
          preco_base?: number
          requisitos_cliente?: string | null
          revisoes_inclusas?: number
          slug: string
          status?: Database["public"]["Enums"]["status_servico_enum"]
          tags?: string[] | null
          titulo: string
          total_avaliacoes?: number | null
          total_pedidos?: number | null
          total_visualizacoes?: number | null
          updated_at?: string | null
          vendedor_id: string
        }
        Update: {
          avaliacao_media?: number | null
          categoria_id?: string
          created_at?: string | null
          deleted_at?: string | null
          descricao_completa?: string
          descricao_curta?: string
          faq?: Json | null
          fluxo_chat_obrigatorio?: boolean | null
          id?: string
          imagem_principal_url?: string | null
          prazo_entrega_dias?: number
          preco_base?: number
          requisitos_cliente?: string | null
          revisoes_inclusas?: number
          slug?: string
          status?: Database["public"]["Enums"]["status_servico_enum"]
          tags?: string[] | null
          titulo?: string
          total_avaliacoes?: number | null
          total_pedidos?: number | null
          total_visualizacoes?: number | null
          updated_at?: string | null
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
        ]
      }
      specialties: {
        Row: {
          id: string
          nome: string
          slug: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          pedido_id: string
          status: Database["public"]["Enums"]["status_transacao_enum"]
          taxa_percentual: number | null
          taxa_valor: number
          tipo: string
          updated_at: string | null
          valor_bruto: number
          valor_liquido: number
          vendedor_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          pedido_id: string
          status?: Database["public"]["Enums"]["status_transacao_enum"]
          taxa_percentual?: number | null
          taxa_valor?: number
          tipo?: string
          updated_at?: string | null
          valor_bruto: number
          valor_liquido: number
          vendedor_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          pedido_id?: string
          status?: Database["public"]["Enums"]["status_transacao_enum"]
          taxa_percentual?: number | null
          taxa_valor?: number
          tipo?: string
          updated_at?: string | null
          valor_bruto?: number
          valor_liquido?: number
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_vendedor_id_fkey"
            columns: ["vendedor_id"]
            isOneToOne: false
            referencedRelation: "perfis_vendedor"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          idioma: string | null
          privacidade_conta: string | null
          receber_emails: boolean | null
          receber_mensagens: boolean | null
          receber_promocoes: boolean | null
          tema: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          idioma?: string | null
          privacidade_conta?: string | null
          receber_emails?: boolean | null
          receber_mensagens?: boolean | null
          receber_promocoes?: boolean | null
          tema?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          idioma?: string | null
          privacidade_conta?: string | null
          receber_emails?: boolean | null
          receber_mensagens?: boolean | null
          receber_promocoes?: boolean | null
          tema?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          asaas_account_id: string | null
          atualizado_em: string | null
          auth_user_id: string
          avatar_url: string | null
          bloqueado_em: string | null
          cpf_cnpj: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string
          id: string
          motivo_bloqueio: string | null
          nome: string
          sobrenome: string
          status: string | null
          status_conta: string | null
          telefone: string | null
          tipo_conta: string | null
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          asaas_account_id?: string | null
          atualizado_em?: string | null
          auth_user_id: string
          avatar_url?: string | null
          bloqueado_em?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email: string
          id?: string
          motivo_bloqueio?: string | null
          nome: string
          sobrenome: string
          status?: string | null
          status_conta?: string | null
          telefone?: string | null
          tipo_conta?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          asaas_account_id?: string | null
          atualizado_em?: string | null
          auth_user_id?: string
          avatar_url?: string | null
          bloqueado_em?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string
          id?: string
          motivo_bloqueio?: string | null
          nome?: string
          sobrenome?: string
          status?: string | null
          status_conta?: string | null
          telefone?: string | null
          tipo_conta?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verificacao_codigos: {
        Row: {
          codigo: string
          criado_em: string | null
          email: string | null
          expira_em: string
          id: string
          ip: string | null
          site_id: string | null
          telefone: string | null
          tentativas: number | null
        }
        Insert: {
          codigo: string
          criado_em?: string | null
          email?: string | null
          expira_em: string
          id?: string
          ip?: string | null
          site_id?: string | null
          telefone?: string | null
          tentativas?: number | null
        }
        Update: {
          codigo?: string
          criado_em?: string | null
          email?: string | null
          expira_em?: string
          id?: string
          ip?: string | null
          site_id?: string | null
          telefone?: string | null
          tentativas?: number | null
        }
        Relationships: []
      }
      verificacoes_email: {
        Row: {
          codigo: string
          criado_em: string | null
          email: string | null
          expira_em: string
          id: string
          tentativas: number
          usado: boolean
          user_id: string | null
          verificado_em: string | null
        }
        Insert: {
          codigo: string
          criado_em?: string | null
          email?: string | null
          expira_em: string
          id?: string
          tentativas?: number
          usado?: boolean
          user_id?: string | null
          verificado_em?: string | null
        }
        Update: {
          codigo?: string
          criado_em?: string | null
          email?: string | null
          expira_em?: string
          id?: string
          tentativas?: number
          usado?: boolean
          user_id?: string | null
          verificado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verificacoes_email_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      verificacoes_whatsapp: {
        Row: {
          codigo: string
          criado_em: string | null
          expira_em: string
          id: string
          telefone: string | null
          tentativas: number
          usado: boolean
          user_id: string | null
          verificado_em: string | null
        }
        Insert: {
          codigo: string
          criado_em?: string | null
          expira_em: string
          id?: string
          telefone?: string | null
          tentativas?: number
          usado?: boolean
          user_id?: string | null
          verificado_em?: string | null
        }
        Update: {
          codigo?: string
          criado_em?: string | null
          expira_em?: string
          id?: string
          telefone?: string | null
          tentativas?: number
          usado?: boolean
          user_id?: string | null
          verificado_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verificacoes_whatsapp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          status: string | null
          tipo: string | null
          valor: number
          wallet_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          tipo?: string | null
          valor: number
          wallet_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          status?: string | null
          tipo?: string | null
          valor?: number
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          id: string
          saldo: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          saldo?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          saldo?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_change_user_password: {
        Args: { new_password: string; target_auth_id: string }
        Returns: boolean
      }
      aprovar_saque_vendedor: {
        Args: { p_saque_id: string }
        Returns: undefined
      }
      cleanup_expired_verificacao_codigos: { Args: never; Returns: undefined }
      get_current_salao_id: { Args: never; Returns: string }
      get_next_order_number: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_salon_balance: {
        Args: { p_amount: number; p_salon_id: string }
        Returns: undefined
      }
      increment_views: { Args: { post_id: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      log_admin_action: {
        Args: {
          p_acao: string
          p_admin_auth_id: string
          p_detalhes: Json
          p_target_usuario_id: string
        }
        Returns: undefined
      }
      solicitar_saque_vendedor: {
        Args: {
          p_chave_pix: string
          p_taxa_valor: number
          p_tipo_pix: string
          p_valor: number
          p_valor_bruto: number
          p_valor_liquido: number
          p_vendedor_id: string
        }
        Returns: undefined
      }
      start_chat_seguro: {
        Args: {
          p_customer_raw_id: string
          p_product_id?: string
          p_seller_raw_id: string
        }
        Returns: {
          created_at: string
          customer_id: string
          id: string
          product_id: string
          seller_id: string
        }[]
      }
      start_chat_seguro_v2: {
        Args: {
          p_customer_raw_id: string
          p_product_id: string
          p_seller_raw_id: string
        }
        Returns: {
          created_at: string
          customer_id: string
          id: string
          order_id: string | null
          product_id: string | null
          seller_id: string
          status_atendimento: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "chats"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "admin" | "user" | "salon"
      appointment_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      order_status: "pending" | "processing" | "completed" | "cancelled"
      payment_status:
        | "pending"
        | "processing"
        | "approved"
        | "rejected"
        | "refunded"
        | "cancelled"
      product_status: "draft" | "published" | "archived"
      salon_status: "pending_approval" | "active" | "suspended" | "inactive"
      saque_status:
        | "solicitado"
        | "em_analise"
        | "processando"
        | "pago"
        | "rejeitado"
        | "cancelado"
      status_pedido_enum:
        | "aguardando"
        | "em_andamento"
        | "entregue"
        | "concluido"
        | "cancelado"
        | "reembolsado"
      status_saque_enum: "pendente" | "aprovado" | "pago" | "recusado"
      status_servico_enum: "rascunho" | "publicado" | "pausado" | "removido"
      status_transacao_enum:
        | "pendente"
        | "aprovado"
        | "pago"
        | "recusado"
        | "estornado"
      status_usuario_enum: "ativo" | "suspenso" | "pendente"
      tipo_conta_enum: "cliente" | "vendedor" | "admin"
      tipo_notificacao_enum:
        | "pedido"
        | "mensagem"
        | "avaliacao"
        | "saque"
        | "sistema"
      transacao_status: "pendente" | "confirmado" | "falho" | "cancelado"
      transacao_tipo:
        | "venda"
        | "saque"
        | "estorno"
        | "taxa"
        | "comissao"
        | "ajuste"
      user_role: "admin" | "seller" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "salon"],
      appointment_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      order_status: ["pending", "processing", "completed", "cancelled"],
      payment_status: [
        "pending",
        "processing",
        "approved",
        "rejected",
        "refunded",
        "cancelled",
      ],
      product_status: ["draft", "published", "archived"],
      salon_status: ["pending_approval", "active", "suspended", "inactive"],
      saque_status: [
        "solicitado",
        "em_analise",
        "processando",
        "pago",
        "rejeitado",
        "cancelado",
      ],
      status_pedido_enum: [
        "aguardando",
        "em_andamento",
        "entregue",
        "concluido",
        "cancelado",
        "reembolsado",
      ],
      status_saque_enum: ["pendente", "aprovado", "pago", "recusado"],
      status_servico_enum: ["rascunho", "publicado", "pausado", "removido"],
      status_transacao_enum: [
        "pendente",
        "aprovado",
        "pago",
        "recusado",
        "estornado",
      ],
      status_usuario_enum: ["ativo", "suspenso", "pendente"],
      tipo_conta_enum: ["cliente", "vendedor", "admin"],
      tipo_notificacao_enum: [
        "pedido",
        "mensagem",
        "avaliacao",
        "saque",
        "sistema",
      ],
      transacao_status: ["pendente", "confirmado", "falho", "cancelado"],
      transacao_tipo: [
        "venda",
        "saque",
        "estorno",
        "taxa",
        "comissao",
        "ajuste",
      ],
      user_role: ["admin", "seller", "customer"],
    },
  },
} as const
