import os

base_dir = os.path.abspath(os.path.dirname(__file__))
postgres_local_base = 'postgresql://postgres:cerveja@localhost/'
database_name = 'sense-todolist'

class BaseConfig:
    """
    Base application configuration
    """
    DEBUG = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(BaseConfig):
    """
    Development application configuration
    """
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', postgres_local_base + database_name)


class ProductionConfig(BaseConfig):
    """
    Production application configuration
    """
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', postgres_local_base + database_name)
