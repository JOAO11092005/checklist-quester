// src/pages/SecretCadastroEstudos/SecretCadastroEstudos.jsx

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, timestamp } from '../../services/firebaseConfig'; // Importando do nosso arquivo central

// Importando os estilos como um módulo
import styles from './SecretCadastroEstudos.module.css';

// URLs das fotos e chaves de acesso
const MALE_PHOTO_URL = "https://i.pinimg.com/736x/3c/06/18/3c0618eeb52c1024a187ab36e26b15b5.jpg";
const FEMALE_PHOTO_URL = "https://i.pinimg.com/736x/33/1a/9a/331a9a0d36c4aa8c45ac6b9538029464.jpg";
const VALID_KEYS = ['curso2025', 'devquest2025'];

const SecretCadastroEstudos = () => {
    // Usando um único estado para gerenciar todos os campos do formulário
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        gender: '',
        accessKey: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Função única para atualizar o estado do formulário
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        // Validação da Chave de Acesso
        if (!VALID_KEYS.includes(formData.accessKey)) {
            setMessage({ type: 'error', text: 'Chave de acesso inválida.' });
            setLoading(false);
            return;
        }

        try {
            // 1. Criar usuário no Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Preparar dados para o Firestore
            const photoURL = formData.gender === 'mulher' ? FEMALE_PHOTO_URL : MALE_PHOTO_URL;
            const finalAccessKey = formData.accessKey === 'devquest2025' ? '' : formData.accessKey;

            // 3. Salvar dados no Firestore
            await setDoc(doc(db, 'users', user.uid), {
                displayName: formData.name,
                photoURL: photoURL,
                accessKey: finalAccessKey,
                lastProfileUpdate: timestamp() // Hora do servidor
            });

            setMessage({ type: 'success', text: 'Cadastro realizado com sucesso!' });
            // Limpar formulário ou redirecionar o usuário
            setFormData({ name: '', email: '', password: '', gender: '', accessKey: ''});

        } catch (error) {
            console.error("Erro no cadastro:", error);
            let friendlyMessage = 'Ocorreu um erro ao se cadastrar.';
            if (error.code === 'auth/email-already-in-use') {
                friendlyMessage = 'Este e-mail já está cadastrado.';
            } else if (error.code === 'auth/weak-password') {
                friendlyMessage = 'A senha precisa ter no mínimo 6 caracteres.';
            }
            setMessage({ type: 'error', text: friendlyMessage });
        } finally {
            // Garante que o loading termine mesmo se der erro
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.registrationCard}>
                <h1>Cadastro Secreto de Estudos</h1>
                <p>Acesso exclusivo para novos membros da jornada dev.</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Nome Completo</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    {/* Repetir para os outros campos... */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
                    </div>
                    <div className={styles.genderGroup}>
                        <span>Gênero:</span>
                        <div className={styles.options}>
                            <label><input type="radio" name="gender" value="homem" checked={formData.gender === 'homem'} onChange={handleChange} required /> Masculino</label>
                            <label><input type="radio" name="gender" value="mulher" checked={formData.gender === 'mulher'} onChange={handleChange} /> Feminino</label>
                        </div>
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="accessKey">Chave de Acesso</label>
                        <input type="password" id="accessKey" name="accessKey" value={formData.accessKey} onChange={handleChange} required />
                    </div>

                    <button type="submit" className={styles.btn} disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Criar Minha Conta'}
                    </button>
                </form>

                {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecretCadastroEstudos;