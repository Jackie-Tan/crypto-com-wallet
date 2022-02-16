import { Card, Select, Table, Tag, Tooltip } from 'antd';
import { SortOrder } from 'antd/lib/table/interface';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { fetchProtocols, Protocol } from '../../../../service/defiLlama';
import { convertToInternationalCurrencySystem } from '../../../../utils/currency';
import { categories, projects, CronosProject, CategoryType } from '../../assets/projects';

const PercentageLabel = (props: { value: number | undefined }) => {
  const { value } = props;

  if (!value) {
    return <span>-</span>;
  }

  const color = value < 0 ? '#D9475A' : '#20BCA4';

  const signedText = value < 0 ? '-' : '+';

  return (
    <span style={{ color }}>
      {signedText}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
};

const CronosDAppsTab = () => {
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>([]);

  const [fetchedProtocols, setFetchedProtocols] = useState<Protocol[]>([]);

  useEffect(() => {
    fetchProtocols()
      .then(protocols => {
        setFetchedProtocols([...protocols]);
      })
      .catch();
  }, []);

  const protocolsMap = useMemo(() => {
    const map = new Map<string, Protocol>();
    fetchedProtocols.forEach(protocol => {
      map.set(protocol.name.toLowerCase(), protocol);
    });

    return map;
  }, [fetchedProtocols]);

  const categoriesNumbersMap = useMemo(() => {
    const map = new Map<CategoryType, number>();
    projects.forEach(p => {
      p.category.forEach(c => {
        const count = map.get(c) || 0;
        map.set(c, count + 1);
      });
    });
    return map;
  }, [projects]);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (project: CronosProject, _, index) => {
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '10% 20% 70%',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                color: '#626973',
              }}
            >
              {index + 1}
            </span>
            <img
              style={{
                width: '24px',
                height: '24px',
                display: 'inline',
                marginLeft: '16px',
                marginRight: '16px',
                borderRadius: '12px',
              }}
              src={`/dapp_logos/${project.logo}`}
              alt="project logo"
            />
            <span
              style={{
                color: '#1199FA',
              }}
            >
              {project.name}
            </span>
          </div>
        );
      },
    },
    {
      title: 'TVL (Total Value Locked)',
      key: 'tvl',
      sortDirections: ['descend', 'ascend'] as SortOrder[],
      render: (project: CronosProject) => {
        const tvl = protocolsMap.get(project.name.toLowerCase())?.tvl ?? 0;

        if (tvl === 0) {
          return <span>-</span>;
        }

        return <Tooltip title={`$${tvl}`}>{convertToInternationalCurrencySystem(tvl)}</Tooltip>;
      },
      sorter: (a: CronosProject, b: CronosProject) => {
        const aTvl = protocolsMap.get(a.name.toLowerCase())?.tvl ?? 0;
        const bTvl = protocolsMap.get(b.name.toLowerCase())?.tvl ?? 0;

        return aTvl - bTvl;
      },
    },
    {
      title: '1D Change',
      key: '1d_change',
      render: (project: CronosProject) => {
        const change = protocolsMap.get(project.name.toLowerCase())?.change_1d;

        return <PercentageLabel value={change} />;
      },
      sortDirections: ['descend', 'ascend'] as SortOrder[],
      sorter: (a: CronosProject, b: CronosProject) => {
        const aValue = protocolsMap.get(a.name.toLowerCase())?.change_1d;
        const bValue = protocolsMap.get(b.name.toLowerCase())?.change_1d;

        if (!aValue || !bValue) {
          return !aValue ? -1 : 1;
        }

        return aValue - bValue;
      },
    },
    {
      title: '7D Change',
      key: '7d_change',
      render: (project: CronosProject) => {
        const change = protocolsMap.get(project.name.toLowerCase())?.change_7d;
        return <PercentageLabel value={change} />;
      },
      sortDirections: ['descend', 'ascend'] as SortOrder[],
      sorter: (a: CronosProject, b: CronosProject) => {
        const aValue = protocolsMap.get(a.name.toLowerCase())?.change_7d;
        const bValue = protocolsMap.get(b.name.toLowerCase())?.change_7d;

        if (!aValue || !bValue) {
          return !aValue ? -1 : 1;
        }

        return aValue - bValue;
      },
    },
    {
      title: 'Category',
      key: 'category',
      render: (project: CronosProject) => (
        <div>
          {project.category.map(c => (
            <Tag color="blue" style={{ borderRadius: '4px', color: '#1199FA' }}>
              {c}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <Select
        mode="multiple"
        showSearch={false}
        style={{ minWidth: '180px' }}
        showArrow
        placeholder="Select Categories"
        onChange={e => {
          setSelectedCategories([...e]);
        }}
        value={selectedCategories}
        tagRender={props => {
          const { label, closable, onClose } = props;
          const onPreventMouseDown = event => {
            event.preventDefault();
            event.stopPropagation();
          };
          return (
            <Tag
              color="blue"
              onMouseDown={onPreventMouseDown}
              closable={closable}
              onClose={onClose}
              style={{ marginRight: 3, borderRadius: '4px', color: '#1199FA' }}
            >
              {label}
            </Tag>
          );
        }}
        options={categories.map(c => {
          return {
            label: `${c} (${categoriesNumbersMap.get(c)})`,
            value: c,
          };
        })}
      />
      <Table
        dataSource={
          selectedCategories.length === 0
            ? projects
            : projects.filter(project => {
                return project.category.some(c => selectedCategories.includes(c));
              })
        }
        columns={columns}
      />
    </Card>
  );
};

export default CronosDAppsTab;
