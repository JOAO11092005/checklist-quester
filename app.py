import os
import shutil
import subprocess
import sys
import stat
import time

def run_cmd(command, cwd=None):
    """Executa um comando de forma robusta e exibe a saída em tempo real."""
    print(f"\nExecutando: {command}", file=sys.stderr)
    try:
        process = subprocess.Popen(command, shell=True, cwd=cwd,
                                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                   text=True, encoding='utf-8', errors='ignore')
        
        for line in process.stdout:
            print(line, end="", flush=True)
        
        process.wait()
        if process.returncode != 0:
            raise subprocess.CalledProcessError(process.returncode, command)
        
        return True
    
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Erro ao executar: {command}", file=sys.stderr)
        print(f"Detalhes do erro: {e}", file=sys.stderr)
        return False

def remove_directory(path):
    """Remove um diretório de forma segura usando um comando de sistema no Windows."""
    if not os.path.exists(path):
        print(f"✅ Nada a remover em: '{path}'", file=sys.stderr)
        return

    try:
        # Tenta a remoção normal primeiro
        shutil.rmtree(path, onerror=handle_remove_error_fallback)
        print(f"✅ Pasta '{path}' removida com sucesso!", file=sys.stderr)
    except Exception as e:
        print(f"\n❌ Falha na remoção. Tentando com comando de sistema...", file=sys.stderr)
        # Se a remoção normal falhar, usa o comando de sistema
        cmd = f'rmdir /s /q "{path}"'
        if run_cmd(cmd):
            print(f"✅ Pasta '{path}' removida com comando de sistema!", file=sys.stderr)
        else:
            print(f"❌ Falha crítica ao remover '{path}'. Por favor, exclua manualmente.", file=sys.stderr)
            sys.exit(1)

def handle_remove_error_fallback(func, path, exc_info):
    """Lida com erros de permissão durante a remoção de arquivos."""
    if exc_info[0] is PermissionError:
        os.chmod(path, stat.S_IWRITE)
        try:
            func(path)
        except Exception as e:
            print(f"⚠️ Erro ao tentar mudar permissões de '{path}'. Erro: {e}", file=sys.stderr)
    else:
        raise

def remove_file(path):
    """Remove um arquivo de forma segura."""
    if os.path.exists(path):
        try:
            os.remove(path)
            print(f"✅ Arquivo '{path}' removido com sucesso!", file=sys.stderr)
        except Exception as e:
            print(f"❌ Falha ao remover arquivo '{path}'. Erro: {e}", file=sys.stderr)

def get_package_manager():
    """Detecta o gerenciador de pacotes do projeto."""
    if os.path.exists("pnpm-lock.yaml"): return "pnpm"
    if os.path.exists("yarn.lock"): return "yarn"
    return "npm"

def main():
    print("Super Node/Vite Project Fixer", file=sys.stderr)
    print("Este script ajuda a corrigir problemas comuns de dependência e build.", file=sys.stderr)

    # 1. Checagem do Node.js
    try:
        node_version = subprocess.check_output("node -v", shell=True, text=True, encoding='utf-8', errors='ignore').strip()
        print(f"-> Node.js detectado: {node_version}", file=sys.stderr)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js não encontrado! Instale-o para continuar.", file=sys.stderr)
        sys.exit(1)

    print("\n--- Limpando dependências e arquivos de build antigos ---", file=sys.stderr)
    remove_directory("node_modules")
    remove_directory("dist")
    remove_file("package-lock.json")
    remove_file("pnpm-lock.yaml")
    remove_file("yarn.lock")

    print("\n--- Reinstalando dependências ---", file=sys.stderr)
    package_manager = get_package_manager()
    print(f"-> Gerenciador de pacotes detectado: {package_manager}", file=sys.stderr)
    
    install_cmd = f"{package_manager} install --force"
    if not run_cmd(install_cmd):
        print("❌ A instalação falhou. Verifique os logs.", file=sys.stderr)
        sys.exit(1)

    print("\n--- Testando o build do projeto ---", file=sys.stderr)
    build_cmd = f"{package_manager} run build"
    if run_cmd(build_cmd):
        print("\n✅ Ambiente corrigido com sucesso!", file=sys.stderr)
        print("Agora você pode rodar 'npm run dev' ou 'pnpm run dev'.", file=sys.stderr)
    else:
        print("\n⚠️ O teste de build falhou. O log acima contém a chave para a solução.", file=sys.stderr)

if __name__ == "__main__":
    main()