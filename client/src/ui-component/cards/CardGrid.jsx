import './CardGrid.css';

const CardGrid = ({
  titulo,
  icono,
  color,
  backgroundColor = '#fff',
  backgroundColorIcon = '#4f46e5',
  borderColor,
  contador = null,
  subtitulo = null,
  trend = null,
  onClick,
  isButton = false,
  href = '#',
  isActive = false
}) => {
  const accentColor = color || backgroundColorIcon;
  const cardStyle = {
    background: backgroundColor,
    borderLeft: `4px solid ${accentColor}`,
    borderColor: borderColor ?? accentColor
  };

  const cardContent = (
    <div className={`card-custom ${isActive ? 'active-card' : ''}`} style={cardStyle}>
      <div className="card-inner">
        <div className="card-left">
          <p className="card-title">{titulo}</p>
          <p className="card-value" style={{ color: accentColor }}>
            {contador !== null ? contador.toLocaleString('es-CO') : '\u00A0'}
          </p>
          {subtitulo && <p className="card-secondary">{subtitulo}</p>}
          {trend && <div className="card-trend">{trend}</div>}
        </div>
        <div className="card-icon" style={{ color: accentColor }}>
          {icono}
        </div>
      </div>
    </div>
  );

  if (isButton) {
    return (
      <div onClick={onClick} className="grid-item" style={{ cursor: 'pointer' }}>
        {cardContent}
      </div>
    );
  }

  return (
    <a href={href} className="grid-item">
      {cardContent}
    </a>
  );
};

export default CardGrid;
